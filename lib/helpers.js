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
exports.supportedBuildOptions = exports.getUuid = exports.exec = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const os = __importStar(require("os"));
const uuid_1 = require("uuid");
function exec(commandLine, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = '';
        yield exec_1.exec(commandLine, args, {
            listeners: {
                stdout: (data) => { output += data.toString().trim(); }
            }
        });
        return output;
    });
}
exports.exec = exec;
function getUuid(url, commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        let additionalInfo;
        if (os.platform() == "darwin") {
            additionalInfo = `macos-${os.arch()}`;
        }
        else {
            let osVersion;
            if (os.version != undefined) {
                osVersion = os.version();
            }
            else {
                core.info('os.version undefined, using `uname -v` instead');
                osVersion = yield exec('uname', ['-v']); // os.version is somehow undefined on GitHub runner
            }
            const swiftVersion = yield exec('swift', ['-version']);
            additionalInfo = `${osVersion}-${os.arch()}-${swiftVersion}`;
        }
        return uuid_1.v5(`${url}-${commitHash}-${additionalInfo}-testing3`, '6050636b-7499-41d4-b9c6-756aff9856d0');
    });
}
exports.getUuid = getUuid;
function supportedBuildOptions(argsToTest) {
    return __awaiter(this, void 0, void 0, function* () {
        const helpText = yield exec('swift', ['build', '--help']);
        let validArgs = [];
        for (const arg of argsToTest) {
            const regex = RegExp(`(${arg})\\s`);
            if (regex.test(helpText)) {
                validArgs.push(arg);
            }
        }
        return validArgs;
    });
}
exports.supportedBuildOptions = supportedBuildOptions;
