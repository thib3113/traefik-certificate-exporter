import fs     from "fs";
import path   from "path";
import mkdirp from "mkdirp";

export default class TraefikCertificateExporter {

    acmeJsonPath;
    destFolder = "./certs";

    static FOLDERS_FLAT = 1;
    static FOLDERS_STRUCTURED = 2;
    static FOLDERS_FLAT_AND_STRUCTURED = 3;

    /**
     * @var {Number}
     */
    structure;

    _acmeData;

    acmeVersion;

    constructor(params) {
        let acmeJsonPath = path.resolve(params.acmeJsonPath);

        let stats = fs.statSync(acmeJsonPath);

        // Is it a directory?
        if (stats.isDirectory()) {
            //it's a directory, try to find acme.json in this
            acmeJsonPath = path.join(acmeJsonPath, "acme.json");
        }

        this.loadAcmeJson(acmeJsonPath);

        this.loadAcmeVersion();
    }

    loadAcmeJson(acmeJsonPath) {
        if (!fs.existsSync(acmeJsonPath))
            throw new Error("The path to the acme.json is mandatory (or to it's parents folder)");

        let acme;
        try {
            acme = JSON.parse(fs.readFileSync(acmeJsonPath));
        }
        catch (e) {
            throw new Error("fail to read acme.json");
        }

        this._acmeData = acme;
    }

    export() {
        return new Promise(async (resolve, reject) => {
            if (!this._acmeData.Certificates)
                reject("fail to read certificates from acme.json");

            this._acmeData.Certificates.forEach(async certificate => {
                let name, privateKey, fullChain, sans;
                if (this.acmeVersion === 1) {
                    name = certificate["Certificate"]["Domain"];
                    privateKey = certificate["Certificate"]["PrivateKey"];
                    fullChain = certificate["Certificate"]["Certificate"];
                    sans = certificate["Domains"]["SANs"];
                }
                else if (this.acmeVersion === 2) {
                    name = certificate["Domain"]["Main"];
                    privateKey = certificate["Key"];
                    fullChain = certificate["Certificate"];
                    sans = certificate["Domain"]["SANs"];
                }

                await this.writeCertificatesFiles(name, {
                    privateKey,
                    fullChain,
                    sans
                });
            });
        });
    }

    writeCertificatesFiles(domain, params) {
        return new Promise((resolve, reject) => {
            let destFolder = path.join(this.destFolder, domain);
            let chain, cert, privateKey, fullChain;

            if (!params.privateKey)
                throw new Error("params privateKey is needed");
            privateKey = Buffer.from(params.privateKey, "base64").toString();

            if (!params.fullChain)
                throw new Error("params fullChain is needed");
            fullChain = Buffer.from(params.fullChain, "base64").toString();


            let start = fullChain.substr(1).indexOf("-----BEGIN CERTIFICATE-----");
            cert = fullChain.substr(0, start);
            chain = fullChain.substr(start);

            mkdirp(destFolder, async () => {
                //write privkey
                await new Promise((resolve, reject) => {
                    fs.writeFile(path.join(destFolder, "privkey.pem"), privateKey, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    fs.writeFile(path.join(destFolder, "fullchain.pem"), fullChain, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    fs.writeFile(path.join(destFolder, "cert.pem"), cert, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    fs.writeFile(path.join(destFolder, "chain.pem"), chain, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                console.log(`certificates for ${domain}${params.sans? ` (${params.sans.join(", ")})`:""} in ${path.resolve(destFolder)}`);
            });

        });
    };

    loadAcmeVersion() {
        this.acmeVersion = 1;

        try {
            if (this._acmeData.Account.Registration.uri.match(/acme-v02/gm)) {
                this.acmeVersion = 2;
            }
        }
        catch (e) {
            console.error("fail to get acme version for your acme.json");
        }


    }
}