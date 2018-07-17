#!/usr/bin/env ./node_modules/.bin/babel-node
import yargs                      from "yargs";
import TraefikCertificateExporter from "./lib/TraefikCertificateExporter";

// let clc = require("cli-color");
// noinspection RequiredAttributes
let argv = yargs
    .usage('usage: $0 <acmeJsonPath>')
    .command('[options] <acmeJsonPath>', 'export certificates from acme.json')
    // .option('no-beep', {
    //     describe: "don't beep after ping respond",
    //     boolean: true,
    //     default: false
    // })
    .help('help')
    .alias("h", "help")
    .wrap(null)
    .argv;


let acmeJsonPath = argv._[0];

let exporter = new TraefikCertificateExporter({
    acmeJsonPath,
});

exporter.export();