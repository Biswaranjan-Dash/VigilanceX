import { Logger } from './reporting';
export type Repository = Record<string, {
    bowername?: string[];
    basePurl?: string;
    npmname?: string;
    vulnerabilities: Vulnerability[];
    extractors: {
        func?: string[];
        uri?: string[];
        filename?: string[];
        filecontent?: string[];
        filecontentreplace?: string[];
        hashes?: Record<string, string>;
        ast?: string[];
    };
    licenses?: string[];
}>;
export type Vulnerability = {
    below: string;
    atOrAbove?: string;
    severity: SeverityLevel;
    cwe: string[];
    identifiers: {
        CVE?: string[];
        bug?: string;
        issue?: string;
        summary?: string;
        githubID?: string;
    };
    info: string[];
};
export type Component = {
    component: string;
    basePurl?: string;
    npmname?: string;
    version: string;
    vulnerabilities?: Vulnerability[];
    detection?: string;
    licenses?: string[];
};
export type Finding = {
    results: Component[];
    file: string;
};
export type Hasher = {
    sha1: (data: string) => string;
};
export declare const severityLevels: {
    readonly none: 0;
    readonly low: 1;
    readonly medium: 2;
    readonly high: 3;
    readonly critical: 4;
};
export type SeverityLevel = keyof typeof severityLevels;
export type PathDescriptor = {
    path: string;
    justification?: string;
};
export type ComponentDescriptor = {
    component: string;
    version?: string;
    severity?: string;
    identifiers?: Vulnerability['identifiers'];
    justification?: string;
};
type Descriptor = PathDescriptor | ComponentDescriptor;
export type Options = {
    log: Logger;
    proxy?: string;
    insecure?: boolean;
    cacertbuf?: Buffer;
    process?: (data: string) => string;
    nocache: boolean;
    cachedir: string;
    ext?: string;
    ignore: {
        descriptors?: Array<Descriptor>;
        paths: RegExp[];
        pathsAsString: string[];
    };
    severity: SeverityLevel;
    verbose?: boolean;
    outputformat?: string;
    outputpath?: string;
    colors?: boolean;
    colorwarn: (msg: string) => string;
    jsRepo?: string;
    path: string;
    exitwith: number;
    includeOsv?: boolean;
    deep?: boolean;
};
export {};
