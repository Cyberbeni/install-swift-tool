"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache = __importStar(require("@actions/cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const os = __importStar(require("os"));
const uuid_1 = require("uuid");
const url = core.getInput('url');
const branch = core.getInput('branch');
const useCache = core.getInput('use-cache') == 'true';
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
let workingDirectory = '';
let productDirectory = '';
let cacheDirectory = '';
function create_working_directory() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Create working directory...', () => __awaiter(this, void 0, void 0, function* () {
            let commitHash = '';
            if (branch) {
                commitHash = yield better_exec('git', ['ls-remote', '-ht', url, `refs/heads/${branch}`, `refs/tags/${branch}`]);
            }
            else {
                commitHash = yield better_exec('git', ['ls-remote', url, `HEAD`]);
            }
            commitHash = commitHash.substring(0, 39);
            const swiftVersion = yield better_exec('swift', ['-version']);
            uuid = uuid_1.v5(`${url}-${commitHash}-${os.version}-${swiftVersion}`, '6050636b-7499-41d4-b9c6-756aff9856d0');
            workingDirectory = `${homeDirectory}/install-swift-tool-${uuid}`;
            productDirectory = `${workingDirectory}/.build/release`;
            cacheDirectory = `${workingDirectory}/.build/*/release`;
            yield exec.exec('mkdir', ['-p', workingDirectory]);
        }));
    });
}
let cacheKey = '';
let didRestore = false;
function try_to_restore() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Try to restore from cache...', () => __awaiter(this, void 0, void 0, function* () {
            cacheKey = `installswifttool-${uuid}`;
            didRestore = (yield cache.restoreCache([cacheDirectory, productDirectory], cacheKey)) !== undefined;
            core.setOutput('cache-hit', `${didRestore}`);
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
function try_to_cache() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Trying to save to cache...', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield cache.saveCache([cacheDirectory, productDirectory], cacheKey);
            }
            catch (error) {
                core.info(error.message);
            }
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
        if (useCache) {
            yield try_to_restore();
        }
        if (!didRestore) {
            yield clone_git();
            yield build_tool();
            if (useCache) {
                yield try_to_cache();
            }
        }
        yield export_path();
    });
}
main().catch(error => { core.setFailed(error.message); });
