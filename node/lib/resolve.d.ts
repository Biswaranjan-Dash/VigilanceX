import { EventEmitter as Emitter } from 'events';
import { Options } from './types';
export declare function scanJsFiles(path: string, options: Options): Emitter;
