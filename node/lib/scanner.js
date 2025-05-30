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
exports.scanJsFile = scanJsFile;
exports.scanBowerFile = scanBowerFile;
exports.on = on;
const events_1 = require("events");
const retire = __importStar(require("./retire"));
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const depsdev_1 = require("./depsdev");
const deepscan_1 = require("./deepscan");
const license_1 = require("./license");
const events = new events_1.EventEmitter();
const hash = {
    sha1: (data) => {
        const shasum = crypto.createHash('sha1');
        shasum.update(data);
        return shasum.digest('hex');
    },
};
function emitResults(finding, options, repo) {
    if (options.includeOsv === true) {
        Promise.all(finding.results.map((r) => (0, depsdev_1.checkOSV)(r.component, r.version, options).then((v) => (r.vulnerabilities = (r.vulnerabilities ?? []).concat(v))))).then(() => filterAndEmitResults(finding, options, repo));
    }
    else {
        filterAndEmitResults(finding, options, repo);
    }
}
function getIdentifiers(v) {
    return (v.identifiers?.CVE ?? [])
        .concat(v.identifiers?.bug ?? [])
        .concat(v.identifiers?.issue ?? [])
        .concat(v.identifiers?.githubID ?? []);
}
function uniqueVulnerabilities(vulnerabilities) {
    if (!vulnerabilities)
        return undefined;
    const unique = [];
    for (const v of vulnerabilities) {
        if (!unique.some((u) => getIdentifiers(u).some((i) => getIdentifiers(v).includes(i)))) {
            unique.push(v);
        }
    }
    return unique;
}
function addLicenses(components, repo) {
    components.forEach((c) => {
        const possibleLicenses = repo[c.component]?.licenses;
        if (possibleLicenses)
            c.licenses = (0, license_1.evaluateLicense)(possibleLicenses, c.version);
    });
}
function filterAndEmitResults(finding, options, repo) {
    finding.results.forEach((r) => (r.vulnerabilities = uniqueVulnerabilities(r.vulnerabilities)));
    if (options.ignore)
        removeIgnored(finding.results, options.ignore);
    if (finding.results.length == 0)
        return;
    addLicenses(finding.results, repo);
    if (retire.isVulnerable(finding.results)) {
        events.emit('vulnerable-dependency-found', finding);
    }
    else {
        events.emit('dependency-found', finding);
    }
}
function shouldIgnorePath(fileSpecs, ignores) {
    return (ignores.paths?.some((i) => {
        return fileSpecs.some((j) => i.test(j) || i.test(path.resolve(j)));
    }) ?? false);
}
function removeIgnored(results, ignores) {
    if (!('descriptors' in ignores))
        return;
    results.forEach((r) => {
        if (!('vulnerabilities' in r))
            return;
        ignores.descriptors
            ?.filter((d) => 'component' in d)
            .forEach((i) => {
            if (r.component !== i.component)
                return;
            if (i.version && r.version !== i.version)
                return;
            if (i.severity) {
                //Remove vulnerabilities with the severity we want to drop
                r.vulnerabilities = r.vulnerabilities?.filter((v) => v.severity != i.severity);
                return;
            }
            if (i.identifiers) {
                removeIgnoredVulnerabilitiesByIdentifier({ ...i.identifiers }, r);
                return;
            }
            r.vulnerabilities = [];
        });
        if (r.vulnerabilities?.length === 0)
            delete r.vulnerabilities;
    });
}
function removeIgnoredVulnerabilitiesByIdentifier(identifiers, result) {
    result.vulnerabilities = result.vulnerabilities?.filter((v) => {
        if (!('identifiers' in v))
            return true;
        return !Object.entries(identifiers || {}).every(([key, value]) => hasIdentifier({ ...v.identifiers }, key, value));
    });
}
function hasIdentifier(identifiers, key, value) {
    if (!(key in identifiers))
        return false;
    const identifier = identifiers[key];
    return Array.isArray(identifier) ? identifier.some((x) => x === value) : identifier === value;
}
function scanJsFile(file, repo, options) {
    if (options.ignore && shouldIgnorePath([file], options.ignore)) {
        return;
    }
    let results = retire.scanFileName(file, repo, true);
    if (!results || results.length === 0) {
        const content = fs.readFileSync(file, 'utf-8');
        results = retire.scanFileContent(content, repo, hash);
        if (options.deep) {
            results = results.concat((0, deepscan_1.deepScan)(content, repo));
        }
    }
    emitResults({ file: file, results: results }, options, repo);
}
function scanBowerFile(file, repo, options) {
    if (options.ignore && shouldIgnorePath([file], options.ignore)) {
        return;
    }
    try {
        const bower = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (bower.version) {
            const results = retire.check(bower.name, bower.version, repo);
            emitResults({ file: file, results: results }, options, repo);
        }
    }
    catch (e) {
        options.log.warn(`Could not parse file: ${file}`);
    }
}
function on(event, handler) {
    events.on(event, handler);
}
