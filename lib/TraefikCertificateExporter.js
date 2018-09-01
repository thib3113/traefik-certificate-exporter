import fs        from "fs";
import path      from "path";
import mkdirp    from "mkdirp";
import minimatch from "minimatch";

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

        this.loadStructure(params.structure);

        let stats = fs.statSync(acmeJsonPath);

        // Is it a directory?
        if (stats.isDirectory()) {
            //it's a directory, try to find acme.json in this
            acmeJsonPath = path.join(acmeJsonPath, "acme.json");
        }

        try {
            this.loadAcmeJson(acmeJsonPath);
            this.loadAcmeVersion();
        }
        catch (e) {
            console.error(e.message);
        }
    }

    loadAcmeJson(acmeJsonPath) {
        if (!fs.existsSync(acmeJsonPath))
            throw new Error(`No acme.json found at "${acmeJsonPath}"`);

        let acme;
        try {
            acme = JSON.parse(fs.readFileSync(acmeJsonPath));
        }
        catch (e) {
            throw new Error("fail to read acme.json");
        }

        this._acmeData = acme;
    }

    /**
     * @return {Promise<string>}
     * @param domains
     */
    export(domains, destination) {

        if(destination)
            this.destFolder = destination;

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

                //check if name is in domain
                if (domains.length < 1 || domains.find(domain =>
                    name === domain ||
                    minimatch(name, domain) ||
                    sans.find(san =>
                    san === domain ||
                    minimatch(san, domain)
                    ) !== undefined
                )
                ) {
                }
                else {
                    return;
                }

                try {
                    let destFolder = await this.createStructureAndWriteCertificates(name, {
                        privateKey,
                        fullChain,
                        sans
                    });

                    console.log(
                        `certificates for ${name}${sans ? ` (${sans.join(", ")})` : ""} in ${destFolder}`);
                }
                catch (e) {
                    console.error(e);
                }
            });
        });
    }

    async createStructureAndWriteCertificates(domain, {privateKey, fullChain, sans}) {
        let destFolder = path.join(this.destFolder, domain);

        return new Promise(async (resolve, reject) => {

            let destFolder = path.resolve(this.destFolder);

            let preFileName = "";
            if (this.structure === TraefikCertificateExporter.FOLDERS_FLAT || this.structure === TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED)
                preFileName = `${domain}-`;
            else
                destFolder = path.join(destFolder, domain);

            await new Promise(async (resolve, reject) => {
                mkdirp(destFolder, async () => {
                    await this.writeCertificatesFiles(`${destFolder}${path.sep}${preFileName}`, {
                        privateKey,
                        fullChain,
                        sans
                    });

                    resolve();
                })
            });

            let structuredName = "";

            if(this.structure === TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED){
                structuredName = path.join(path.resolve(this.destFolder), domain);

                await new Promise(async (resolve, reject) => {

                    mkdirp(structuredName, async () => {

                        await this.writeCertificatesFiles(structuredName+path.sep, {
                            privateKey,
                            fullChain,
                            sans
                        });
                        resolve();
                    })

                });
                resolve(`${destFolder+preFileName} and ${structuredName}`)
            }
            else{
                resolve(destFolder+preFileName);
            }
        });
    }

    writeCertificatesFiles(destFolder, params) {
        return new Promise(async (resolve, reject) => {
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

            //write privkey
            await new Promise((resolve, reject) => {
                fs.writeFile(`${destFolder}privkey.pem`, privateKey, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            await new Promise((resolve, reject) => {
                fs.writeFile(`${destFolder}fullchain.pem`, fullChain, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            await new Promise((resolve, reject) => {
                fs.writeFile(`${destFolder}cert.pem`, cert, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            await new Promise((resolve, reject) => {
                fs.writeFile(`${destFolder}chain.pem`, chain, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            resolve();

            // reject("Test Error !");
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

    loadStructure(structure) {
        if (structure > TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED || structure < TraefikCertificateExporter.FOLDERS_FLAT) {
            this.structure = TraefikCertificateExporter.FOLDERS_STRUCTURED;
        }
        else {
            this.structure = structure;
        }
    }
}