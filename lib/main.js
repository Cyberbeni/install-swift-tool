"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache = __importStar(require("@actions/cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const os = __importStar(require("os"));
const v5_1 = __importDefault(require("uuid/v5"));
const util_1 = require("util");
const url = core.getInput('url');
const branch = core.getInput('branch');
const saveToCache = core.getInput('save-to-cache') == 'true';
const restoreFromCache = core.getInput('restore-from-cache') == 'true';
const homeDirectory = os.homedir();
/** vvv HELPERS vvv */
function better_exec(commandLine, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = '';
        yield exec.exec(commandLine, args, {
            listeners: {
                stdout: (data) => { output = data.toString().trim(); }
            }
        });
        return output;
    });
}
/** ^^^ HELPERS ^^^ */
let uuid = '';
let swiftVersion = '';
let workingDirectory = '';
let productDirectory = '';
let commitHash = '';
function create_working_directory() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Create working directory...', () => __awaiter(this, void 0, void 0, function* () {
            if (branch) {
                commitHash = yield better_exec('git', ['ls-remote', '-ht', url, `refs/heads/${branch}`, `refs/tags/${branch}`]);
            }
            else {
                commitHash = yield better_exec('git', ['ls-remote', url, `HEAD`]);
            }
            commitHash = commitHash.substring(0, 39);
            uuid = v5_1.default(`${url}-${commitHash}-${swiftVersion}`, 'installswifttool');
            workingDirectory = `${homeDirectory}/install-swift-tool-${uuid}`;
            productDirectory = `${workingDirectory}/.build/release`;
            swiftVersion = yield better_exec('swift', ['-version']);
            yield exec.exec('mkdir', ['-p', workingDirectory]);
        }));
    });
}
let didRestore = false;
function try_to_restore() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Try to restore from cache...', () => __awaiter(this, void 0, void 0, function* () {
            didRestore = !util_1.isUndefined(yield cache.restoreCache([productDirectory], `installswifttool-${uuid}`));
        }));
    });
}
function clone_git() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Clone repo...', () => __awaiter(this, void 0, void 0, function* () {
            if (branch) {
                yield exec.exec('git', ['clone', '--depth', '1', '--branch', branch, url, workingDirectory]);
            }
            else {
                yield exec.exec('git', ['clone', '--depth', '1', url, workingDirectory]);
            }
            yield exec.exec('git', ['-C', workingDirectory, 'rev-parse', 'HEAD']);
        }));
    });
}
function build_tool() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Build tool...', () => __awaiter(this, void 0, void 0, function* () {
            yield exec.exec('swift', ['build', '--package-path', workingDirectory, '--configuration', 'release', '--disable-sandbox']);
        }));
    });
}
function save_to_cache() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Save to cache...', () => __awaiter(this, void 0, void 0, function* () {
            yield cache.saveCache([productDirectory], `installswifttool-${uuid}`);
        }));
    });
}
function export_path() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Export path...', () => __awaiter(this, void 0, void 0, function* () {
            core.addPath(productDirectory);
        }));
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield create_working_directory();
        if (restoreFromCache) {
            yield try_to_restore();
        }
        if (!didRestore) {
            yield clone_git();
            yield build_tool();
        }
        if (saveToCache) {
            yield save_to_cache();
        }
        yield export_path();
    });
}
main().catch(error => { core.setFailed(error.message); });
