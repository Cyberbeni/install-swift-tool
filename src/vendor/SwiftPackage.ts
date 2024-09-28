// Source: https://github.com/swiftlang/vscode-swift/blob/689bdead11e55afe99fb1a3049af01ac186d70ad/src/SwiftPackage.ts

//===----------------------------------------------------------------------===//
//
// This source file is part of the VS Code Swift open source project
//
// Copyright (c) 2021-2023 the VS Code Swift project authors
// Licensed under Apache License v2.0
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VS Code Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import * as path from "path";

/** Swift Package.resolved file */
export class PackageResolved {
    readonly pins: PackageResolvedPin[];
    readonly version: number;

    constructor(fileContents: string) {
        const json = JSON.parse(fileContents);
        const version = <{ version: number }>json;
        this.version = version.version;

        if (this.version === 1) {
            const v1Json = json as PackageResolvedFileV1;
            this.pins = v1Json.object.pins.map(
                pin =>
                    new PackageResolvedPin(
                        this.identity(pin.repositoryURL),
                        pin.repositoryURL,
                        pin.state
                    )
            );
        } else if (this.version === 2 || this.version === 3) {
            const v2Json = json as PackageResolvedFileV2;
            this.pins = v2Json.pins.map(
                pin => new PackageResolvedPin(pin.identity, pin.location, pin.state)
            );
        } else {
            throw Error("Unsupported Package.resolved version");
        }
    }

    // Copied from `PackageIdentityParser.computeDefaultName` in
    // https://github.com/apple/swift-package-manager/blob/main/Sources/PackageModel/PackageIdentity.swift
    identity(url: string): string {
        const file = path.basename(url, ".git");
        return file.toLowerCase();
    }
}

/** Swift Package.resolved file */
export class PackageResolvedPin {
    constructor(
        readonly identity: string,
        readonly location: string,
        readonly state: PackageResolvedPinState
    ) {}
}

/** Swift Package.resolved file */
export interface PackageResolvedPinState {
    branch: string | null;
    revision: string;
    version: string | null;
}

interface PackageResolvedFileV1 {
    object: { pins: PackageResolvedPinFileV1[] };
    version: number;
}

interface PackageResolvedPinFileV1 {
    package: string;
    repositoryURL: string;
    state: PackageResolvedPinState;
}

interface PackageResolvedFileV2 {
    pins: PackageResolvedPinFileV2[];
    version: number;
}

interface PackageResolvedPinFileV2 {
    identity: string;
    location: string;
    state: PackageResolvedPinState;
}
