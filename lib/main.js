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
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const os = __importStar(require("os"));
const uuid = __importStar(require("uuid"));
const url = core.getInput('url');
const branch = core.getInput('branch');
const homeDirectory = os.homedir();
const workingDirectory = `${homeDirectory}/action-install-swift-tool-${uuid()}`;
const productDirectory = `${workingDirectory}/.build/release`;
function create_working_directory() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Create working directory...', () => __awaiter(this, void 0, void 0, function* () {
            yield exec.exec('mkdir', ['-p', workingDirectory]);
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
        }));
    });
}
function build_tool() {
    return __awaiter(this, void 0, void 0, function* () {
        yield core.group('Build tool...', () => __awaiter(this, void 0, void 0, function* () {
            yield exec.exec('cd', [workingDirectory]);
            yield exec.exec('swift', ['build', '--configuration', 'release', '--disable-sandbox']);
        }));
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield create_working_directory();
        yield clone_git();
        yield build_tool();
        core.addPath(productDirectory);
    });
}
main().catch(error => { core.setFailed(error.message); });
