#!/usr/bin/env ./node_modules/.bin/babel-node
import yargs                      from "yargs";
import TraefikCertificateExporter from "./lib/TraefikCertificateExporter";

// let clc = require("cli-color");
// noinspection RequiredAttributes
let argv = yargs
    .usage('usage: $0 <acmeJsonPath>')
    .command('[options] <acmeJsonPath>', 'export certificates from acme.json')
    .option('domain', {
        describe: "specify domain to export ( support blob, and comma separated string )",
        alias: "d"
    })
    .option('output-folder', {
        describe: "specify the folder where the certs are exported",
        alias: "o"
    })
    .option('folder-structure', {
        describe: "folder structure (1 = no folders, 2 = structured by main domain, 3 = 1+2)",
        alias: "s",
        default:TraefikCertificateExporter.FOLDERS_STRUCTURED
    })
    .help('help')
    .alias("h", "help")
    .wrap(null)
    .argv;


let acmeJsonPath = argv._[0] || ".";

let domains = [];

(argv.d||[]).forEach(domain => {
   if(domain.match(/,/i)){
       domain.split(",").forEach(d => domains.push(d));
   }
   else{
       domains.push(domain);
   }
});

let exporter = new TraefikCertificateExporter({
    acmeJsonPath,
    structure:argv.s
});

// noinspection JSIgnoredPromiseFromCall
exporter.export(domains);