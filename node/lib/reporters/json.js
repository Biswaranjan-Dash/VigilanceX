"use strict";
/*jshint esversion: 6 */
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
exports.default = {
    configure: (logger, writer, config) => {
        const scanStart = Date.now();
        const finalResults = {
            version: retire.version,
            start: new Date(),
            data: [],
            messages: [],
            errors: [],
            time: undefined,
        };
        logger.info = finalResults.messages.push;
        logger.debug = config.verbose
            ? finalResults.messages.push
            : () => {
                return;
            };
        logger.warn = logger.error = (message) => finalResults.errors.push(message);
        logger.logVulnerableDependency = (finding) => {
            if (!config.verbose) {
                finding.results = finding.results.filter((r) => retire.isVulnerable([r]));
            }
            finalResults.data.push(finding);
        };
        logger.logDependency = function (finding) {
            if (config.verbose && finding.results.length > 0) {
                finalResults.data.push(finding);
            }
        };
        logger.close = function (callback) {
            finalResults.time = (Date.now() - scanStart) / 1000;
            const res = config.outputformat === 'jsonsimple' ? finalResults.data : finalResults;
            writer.out(JSON.stringify(res));
            writer.close(callback);
        };
    },
};
