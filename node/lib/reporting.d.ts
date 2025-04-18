import { Finding } from './types';
export type LoggerOptions = {
    outputpath: string;
    verbose: boolean;
    colors: boolean;
    outputformat: string;
    jsRepo: string;
    path: string;
    colorwarn: (s: string) => string;
};
export type Hasher = {
    md5: (file: Buffer | string) => string;
    sha1: (file: Buffer | string) => string;
    sha256: (file: Buffer | string) => string;
    sha512: (file: Buffer | string) => string;
};
export declare const hash: Hasher;
export type Writer = {
    out: (...args: Parameters<(typeof console)['log']>) => void;
    err: (x: string) => void;
    close: (callback?: () => void) => void;
};
export type Logger = {
    info: (x: string) => void;
    debug: (x: string) => void;
    warn: (x: string) => void;
    error: (x: string) => void;
    logDependency: (finding: Finding) => void;
    logVulnerableDependency: (finding: Finding) => void;
    close: (callback?: () => void) => void;
};
export interface ConfigurableLogger {
    configure: (logger: Logger, writer: Writer, config: LoggerOptions, hash: Hasher) => void;
}
export declare function open(config: LoggerOptions): Logger;
