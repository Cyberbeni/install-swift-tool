export declare function exec(commandLine: string, args?: string[]): Promise<string>;
export declare function getUuid(url: string, commitHash: string): Promise<string>;
export declare function supportedBuildOptions(argsToTest: string[]): Promise<string[]>;
