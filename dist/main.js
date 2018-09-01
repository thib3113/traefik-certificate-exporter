#!/usr/bin/env node
"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _yargs = require("yargs");

var _yargs2 = _interopRequireDefault(_yargs);

var _TraefikCertificateExporter = require("./lib/TraefikCertificateExporter");

var _TraefikCertificateExporter2 = _interopRequireDefault(_TraefikCertificateExporter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// let clc = require("cli-color");
// noinspection RequiredAttributes
var argv = _yargs2.default.usage('usage: $0 <acmeJsonPath>').command('[options] <acmeJsonPath>', 'export certificates from acme.json').option('domain', {
    describe: "specify domain to export ( support blob, and comma separated string )",
    alias: "d"
}).option('output-folder', {
    describe: "specify the folder where the certs are exported",
    alias: "o",
    default: ""
}).option('folder-structure', {
    describe: "folder structure (1 = no folders, 2 = structured by main domain, 3 = 1+2)",
    alias: "s",
    default: _TraefikCertificateExporter2.default.FOLDERS_STRUCTURED
}).help('help').alias("h", "help").wrap(null).argv;

var acmeJsonPath = argv._[0] || ".";

var domains = [];

var domainArgs = [];

if (Array.isArray(argv.d)) {
    domainArgs = argv.d;
} else if ((0, _typeof3.default)(argv.d) === (0, _typeof3.default)("aa")) {
    domainArgs = [argv.d];
}

domainArgs.forEach(function (domain) {
    if (domain.match(/,/i)) {
        domain.split(",").forEach(function (d) {
            return domains.push(d);
        });
    } else {
        domains.push(domain);
    }
});

var exporter = new _TraefikCertificateExporter2.default({
    acmeJsonPath: acmeJsonPath,
    structure: argv.s
});

// noinspection JSIgnoredPromiseFromCall
exporter.export(domains, argv.o);