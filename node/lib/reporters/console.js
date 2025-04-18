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
Object.defineProperty(exports, "__esModule", { value: true });
const retire = __importStar(require("../retire"));
const utils = __importStar(require("../utils"));
function printResults(logger, finding, config) {
    if (finding.results && finding.results.length > 0) {
        const logFunc = retire.isVulnerable(finding.results) ? logger.warn : logger.info;
        const printed = new Set();
        finding.results.forEach((elm) => {
            if (!config.verbose && !retire.isVulnerable([elm]))
                return;
            const key = `${elm.component} ${elm.version}`;
            logFunc(finding.file);
            logFunc(` ${String.fromCharCode(8627)} ${key}`);
            if (printed.has(key))
                return;
            if (retire.isVulnerable([elm])) {
                logFunc(`${key} has known vulnerabilities:${printVulnerability(elm, config)}`);
            }
            printed.add(key);
        });
    }
}
function printVulnerability(component, config) {
    let string = '';
    component.vulnerabilities?.forEach((vulnerability) => {
        string += config.outputformat === 'clean' ? '\n   ' : ' ';
        if (vulnerability.severity) {
            string += `severity: ${vulnerability.severity}; `;
        }
        if (vulnerability.identifiers) {
            string +=
                Object.entries(vulnerability.identifiers)
                    .map(([name, id]) => {
                    return `${name}: ${utils.flatten([Array.isArray(id) ? id : [id]]).join(' ')}`;
                })
                    .join(', ') + '; ';
        }
        string += vulnerability.info.join(config.outputformat === 'clean' ? '\n' : ' ');
    });
    return string;
}
exports.default = {
    configure: (logger, _, config) => {
        logger.logDependency = (finding) => {
            if (config.verbose)
                printResults(logger, finding, config);
        };
        logger.logVulnerableDependency = (component) => {
            printResults(logger, component, config);
        };
    },
};
