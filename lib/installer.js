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
exports.SwiftToolInstaller = void 0;
const cache = __importStar(require("@actions/cache"));
const core = __importStar(require("@actions/core"));
const os = __importStar(require("os"));
const semver = __importStar(require("semver"));
const helpers_1 = require("./helpers");
class SwiftToolInstaller {
    constructor(url, branch, version, useCache) {
        this.uuid = '';
        this.cacheKey = '';
        this.workingDirectory = '';
        this.productDirectory = '';
        this.cacheDirectory = '';
        this.didRestore = false;
        this.url = url;
        this.branch = branch;
        this.version = version;
        this.useCache = useCache;
    }
    // Steps
    resolveVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Resolving version requirement', () => __awaiter(this, void 0, void 0, function* () {
                let versions = (yield helpers_1.exec('git', ['ls-remote', '--refs', '--tags', this.url]))
                    .split('\n')
                    .map(function (value) {
                    var _a;
                    return (_a = value.split('/').pop()) !== null && _a !== void 0 ? _a : '';
                });
                let targetVersion = semver.maxSatisfying(versions, this.version);
                if (targetVersion) {
                    core.info(`Resolved version: ${targetVersion}`);
                    this.branch = targetVersion;
                }
                else {
                    throw Error(`No version satisfying '${this.version}' found.`);
                }
            }));
        });
    }
    updateDirectoryNames(newUuid) {
        this.uuid = newUuid;
        this.cacheKey = `installswifttool-${this.uuid}`;
        this.workingDirectory = `${os.homedir()}/install-swift-tool-${this.uuid}`;
        this.productDirectory = `${this.workingDirectory}/.build/release`;
        this.cacheDirectory = `${this.workingDirectory}/.build/*/release`;
    }
    createWorkingDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Creating working directory', () => __awaiter(this, void 0, void 0, function* () {
                let commitHash = '';
                if (this.branch) {
                    commitHash = yield helpers_1.exec('git', ['ls-remote', '-ht', this.url, `refs/heads/${this.branch}`, `refs/tags/${this.branch}`]);
                }
                else {
                    commitHash = yield helpers_1.exec('git', ['ls-remote', this.url, `HEAD`]);
                }
                commitHash = commitHash.substring(0, 40);
                this.updateDirectoryNames(yield helpers_1.getUuid(this.url, commitHash));
                yield helpers_1.exec('mkdir', ['-p', this.workingDirectory]);
            }));
        });
    }
    tryToRestore() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Trying to restore from cache', () => __awaiter(this, void 0, void 0, function* () {
                this.didRestore = (yield cache.restoreCache([this.cacheDirectory, this.productDirectory], this.cacheKey)) !== undefined;
            }));
        });
    }
    cloneGit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Cloning repo', () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (this.branch) {
                    yield helpers_1.exec('git', ['clone', '--depth', '1', '--branch', this.branch, this.url, this.workingDirectory]);
                }
                else {
                    yield helpers_1.exec('git', ['clone', '--depth', '1', this.url, this.workingDirectory]);
                }
                // `git rev-parse HEAD` gave different result than `git ls-remote -ht ...`
                // when used with an annotated tag: https://stackoverflow.com/a/15472310
                // This seems to print the same hash(es) but only if `git clone` used `--depth 1`
                const commitHash = (_a = (yield helpers_1.exec('git', ['-C', this.workingDirectory, 'show-ref', '-s']))
                    .split('\n')
                    .pop()) !== null && _a !== void 0 ? _a : '';
                const newUuid = yield helpers_1.getUuid(this.url, commitHash);
                if (this.uuid != newUuid) {
                    const oldWorkingDirectory = this.workingDirectory;
                    this.updateDirectoryNames(newUuid);
                    yield helpers_1.exec('mv', [oldWorkingDirectory, this.workingDirectory]);
                }
            }));
        });
    }
    buildTool() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Building tool', () => __awaiter(this, void 0, void 0, function* () {
                yield helpers_1.exec('swift', ['build', '--package-path', this.workingDirectory, '--configuration', 'release', '--disable-sandbox']);
            }));
        });
    }
    tryToCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Trying to save to cache', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield cache.saveCache([this.cacheDirectory, this.productDirectory], this.cacheKey);
                }
                catch (error) {
                    core.info(error.message);
                }
            }));
        });
    }
    exportPath() {
        return __awaiter(this, void 0, void 0, function* () {
            yield core.group('Exporting path', () => __awaiter(this, void 0, void 0, function* () {
                core.addPath(this.productDirectory);
            }));
        });
    }
    // Run
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.version) {
                yield this.resolveVersion();
            }
            yield this.createWorkingDirectory();
            if (this.useCache) {
                yield this.tryToRestore();
            }
            if (!this.didRestore) {
                yield this.cloneGit();
                yield this.buildTool();
                if (this.useCache) {
                    yield this.tryToCache();
                }
            }
            yield this.exportPath();
        });
    }
    static install(url, branch, version, useCache) {
        return __awaiter(this, void 0, void 0, function* () {
            const installer = new SwiftToolInstaller(url, branch, version, useCache);
            yield installer.install();
        });
    }
}
exports.SwiftToolInstaller = SwiftToolInstaller;
