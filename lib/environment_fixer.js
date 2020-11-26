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
exports.SwiftEnvironmentFixer = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const process_1 = require("process");
const helpers_1 = require("./helpers");
class SwiftEnvironmentFixer {
    static fixTar() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group(`Ensuring gnu-tar is used`, () => __awaiter(this, void 0, void 0, function* () {
                // https://github.com/Cyberbeni/install-swift-tool/issues/69
                // https://formulae.brew.sh/formula/gnu-tar
                // PATH="$(brew --prefix)/opt/gnu-tar/libexec/gnubin:$PATH"
                if ((yield helpers_1.exec('tar', ['--version'])).includes('GNU tar')) {
                    return;
                }
                yield helpers_1.exec('brew', ['install', 'gnu-tar']);
                const brewPrefix = yield helpers_1.exec('brew', ['--prefix']);
                core.addPath(`${brewPrefix}/opt/gnu-tar/libexec/gnubin`);
            }));
        });
    }
    static fixSourceKitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            // https://github.com/Cyberbeni/install-swift-tool/issues/68
            const envVar = 'LINUX_SOURCEKIT_LIB_PATH';
            if (process_1.env[envVar] != undefined) {
                return;
            }
            yield core.group(`Setting ${envVar}`, () => __awaiter(this, void 0, void 0, function* () {
                let exported = false;
                const libName = 'libsourcekitdInProc.so';
                const possiblePaths = ['/usr/share/swift/usr/lib', '/usr/lib'];
                for (const path of possiblePaths) {
                    if (fs.existsSync(`${path}/${libName}`)) {
                        core.info(`Setting to: '${path}'`);
                        core.exportVariable(envVar, path);
                        exported = true;
                        break;
                    }
                }
                if (!exported) {
                    core.warning(`Failed to find suitable path for ${envVar}`);
                }
            }));
        });
    }
    static fixBeforeRun() {
        return __awaiter(this, void 0, void 0, function* () {
            if (os.platform() == 'darwin') {
                yield this.fixTar();
            }
        });
    }
    static fixAfterRun() {
        return __awaiter(this, void 0, void 0, function* () {
            if (os.platform() == 'linux') {
                yield this.fixSourceKitPath();
            }
        });
    }
}
exports.SwiftEnvironmentFixer = SwiftEnvironmentFixer;
