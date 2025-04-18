"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
exports.open = open;
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const console_1 = __importDefault(require("./reporters/console"));
const json_1 = __importDefault(require("./reporters/json"));
const depcheck_1 = __importDefault(require("./reporters/depcheck"));
const cyclonedx_1 = __importDefault(require("./reporters/cyclonedx"));
const cyclonedx_json_1 = __importDefault(require("./reporters/cyclonedx-json"));
const cyclonedx_1_6_json_1 = __importDefault(require("./reporters/cyclonedx-1_6-json"));
const loggers = {
    console: console_1.default,
    text: console_1.default,
    json: json_1.default,
    depcheck: depcheck_1.default,
    cyclonedx: cyclonedx_1.default,
    cyclonedxJSON: cyclonedx_json_1.default,
    cyclonedxJSON1_6: cyclonedx_1_6_json_1.default,
    clean: console_1.default,
    jsonsimple: json_1.default,
};
let colorwarn = (x) => {
    return x;
};
let verbose = false;
function hashContent(hash, content) {
    const h = crypto.createHash(hash);
    h.update(content);
    return h.digest('hex');
}
exports.hash = {
    md5: (file) => hashContent('md5', file),
    sha1: (file) => hashContent('sha1', file),
    sha256: (file) => hashContent('sha256', file),
    sha512: (file) => hashContent('sha512', file),
};
const writer = {
    out: console.log,
    err: (x) => {
        console.warn(colorwarn(x));
    },
    close: () => {
        return;
    },
};
const logger = {
    info: (x) => {
        writer.out(x);
    },
    debug: (x) => {
        if (verbose)
            writer.out(x);
    },
    warn: (x) => {
        writer.err(x);
    },
    error: (x) => {
        writer.err(x);
    },
    logDependency: () => {
        return;
    },
    logVulnerableDependency: () => {
        return;
    },
    close: () => writer.close(),
};
function configureFileWriter(config) {
    if (!config.outputpath)
        return;
    const fileDescriptor = fs.openSync(config.outputpath, 'w');
    if (fileDescriptor < 0) {
        console.error(`Could not open ${config.outputpath} for writing`);
        process.exit(9);
    }
    const fileOutput = {
        fileDescriptor,
        stream: fs.createWriteStream('', { fd: fileDescriptor, autoClose: false }),
    };
    const writeToFile = (message) => {
        fileOutput.stream.write(message);
        fileOutput.stream.write('\n');
    };
    writer.out = writer.err = writeToFile;
    writer.close = () => {
        fileOutput.stream.on('finish', () => {
            fs.closeSync(fileOutput.fileDescriptor);
        });
        fileOutput.stream.end();
    };
}
function open(config) {
    verbose = config.verbose ?? false;
    if (config.colors)
        colorwarn = config.colorwarn;
    const format = config.outputformat || 'console';
    if (!(format in loggers)) {
        console.warn(`Invalid outputformat: ${format}`);
        process.exit(1);
    }
    loggers[format].configure(logger, writer, config, exports.hash);
    configureFileWriter(config);
    return logger;
}
