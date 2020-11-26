export declare class SwiftEnvironmentFixer {
    static fixTar(): Promise<void>;
    static fixSourceKitPath(): Promise<void>;
    static fixBeforeRun(cachingEnabled: boolean): Promise<void>;
    static fixAfterRun(): Promise<void>;
}
