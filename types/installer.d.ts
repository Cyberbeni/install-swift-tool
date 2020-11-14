export declare class SwiftToolInstaller {
    readonly url: string;
    branch: string;
    readonly version: string;
    readonly useCache: boolean;
    private constructor();
    resolveVersion(): Promise<void>;
    uuid: string;
    cacheKey: string;
    workingDirectory: string;
    productDirectory: string;
    cacheDirectory: string;
    updateDirectoryNames(newUuid: string): void;
    createWorkingDirectory(): Promise<void>;
    didRestore: boolean;
    tryToRestore(): Promise<void>;
    cloneGit(): Promise<void>;
    buildTool(): Promise<void>;
    tryToCleanupIntermediateBuildProducts(): Promise<void>;
    tryToCache(): Promise<void>;
    exportPath(): Promise<void>;
    install(): Promise<void>;
    static install(url: string, branch?: string, version?: string, useCache?: boolean): Promise<void>;
}
