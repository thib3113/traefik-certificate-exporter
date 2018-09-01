"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _minimatch = require("minimatch");

var _minimatch2 = _interopRequireDefault(_minimatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TraefikCertificateExporter = function () {
    function TraefikCertificateExporter(params) {
        (0, _classCallCheck3.default)(this, TraefikCertificateExporter);
        this.destFolder = "./certs";

        var acmeJsonPath = _path2.default.resolve(params.acmeJsonPath);

        this.loadStructure(params.structure);

        var stats = _fs2.default.statSync(acmeJsonPath);

        // Is it a directory?
        if (stats.isDirectory()) {
            //it's a directory, try to find acme.json in this
            acmeJsonPath = _path2.default.join(acmeJsonPath, "acme.json");
        }

        try {
            this.loadAcmeJson(acmeJsonPath);
            this.loadAcmeVersion();
        } catch (e) {
            console.error(e.message);
        }
    }

    /**
     * @var {Number}
     */


    (0, _createClass3.default)(TraefikCertificateExporter, [{
        key: "loadAcmeJson",
        value: function loadAcmeJson(acmeJsonPath) {
            if (!_fs2.default.existsSync(acmeJsonPath)) throw new Error("No acme.json found at \"" + acmeJsonPath + "\"");

            var acme = void 0;
            try {
                acme = JSON.parse(_fs2.default.readFileSync(acmeJsonPath));
            } catch (e) {
                throw new Error("fail to read acme.json");
            }

            this._acmeData = acme;
        }

        /**
         * @return {Promise<string>}
         * @param domains
         */

    }, {
        key: "export",
        value: function _export(domains, destination) {
            var _this = this;

            if (destination) this.destFolder = destination;

            return new _promise2.default(function () {
                var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve, reject) {
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (!_this._acmeData.Certificates) reject("fail to read certificates from acme.json");

                                    _this._acmeData.Certificates.forEach(function () {
                                        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(certificate) {
                                            var name, privateKey, fullChain, sans, destFolder;
                                            return _regenerator2.default.wrap(function _callee$(_context) {
                                                while (1) {
                                                    switch (_context.prev = _context.next) {
                                                        case 0:
                                                            name = void 0, privateKey = void 0, fullChain = void 0, sans = void 0;


                                                            if (_this.acmeVersion === 1) {
                                                                name = certificate["Certificate"]["Domain"];
                                                                privateKey = certificate["Certificate"]["PrivateKey"];
                                                                fullChain = certificate["Certificate"]["Certificate"];
                                                                sans = certificate["Domains"]["SANs"];
                                                            } else if (_this.acmeVersion === 2) {
                                                                name = certificate["Domain"]["Main"];
                                                                privateKey = certificate["Key"];
                                                                fullChain = certificate["Certificate"];
                                                                sans = certificate["Domain"]["SANs"];
                                                            }

                                                            //check if name is in domain

                                                            if (!(domains.length < 1 || domains.find(function (domain) {
                                                                return name === domain || (0, _minimatch2.default)(name, domain) || sans.find(function (san) {
                                                                    return san === domain || (0, _minimatch2.default)(san, domain);
                                                                }) !== undefined;
                                                            }))) {
                                                                _context.next = 5;
                                                                break;
                                                            }

                                                            _context.next = 6;
                                                            break;

                                                        case 5:
                                                            return _context.abrupt("return");

                                                        case 6:
                                                            _context.prev = 6;
                                                            _context.next = 9;
                                                            return _this.createStructureAndWriteCertificates(name, {
                                                                privateKey: privateKey,
                                                                fullChain: fullChain,
                                                                sans: sans
                                                            });

                                                        case 9:
                                                            destFolder = _context.sent;


                                                            console.log("certificates for " + name + (sans ? " (" + sans.join(", ") + ")" : "") + " in " + destFolder);
                                                            _context.next = 16;
                                                            break;

                                                        case 13:
                                                            _context.prev = 13;
                                                            _context.t0 = _context["catch"](6);

                                                            console.error(_context.t0);

                                                        case 16:
                                                        case "end":
                                                            return _context.stop();
                                                    }
                                                }
                                            }, _callee, _this, [[6, 13]]);
                                        }));

                                        return function (_x3) {
                                            return _ref2.apply(this, arguments);
                                        };
                                    }());

                                case 2:
                                case "end":
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, _this);
                }));

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            }());
        }
    }, {
        key: "createStructureAndWriteCertificates",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(domain, _ref4) {
                var _this2 = this;

                var privateKey = _ref4.privateKey,
                    fullChain = _ref4.fullChain,
                    sans = _ref4.sans;
                var destFolder;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                destFolder = _path2.default.join(this.destFolder, domain);
                                return _context8.abrupt("return", new _promise2.default(function () {
                                    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(resolve, reject) {
                                        var destFolder, preFileName, structuredName;
                                        return _regenerator2.default.wrap(function _callee7$(_context7) {
                                            while (1) {
                                                switch (_context7.prev = _context7.next) {
                                                    case 0:
                                                        destFolder = _path2.default.resolve(_this2.destFolder);
                                                        preFileName = "";

                                                        if (_this2.structure === TraefikCertificateExporter.FOLDERS_FLAT || _this2.structure === TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED) preFileName = domain + "-";else destFolder = _path2.default.join(destFolder, domain);

                                                        _context7.next = 5;
                                                        return new _promise2.default(function () {
                                                            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(resolve, reject) {
                                                                return _regenerator2.default.wrap(function _callee4$(_context4) {
                                                                    while (1) {
                                                                        switch (_context4.prev = _context4.next) {
                                                                            case 0:
                                                                                (0, _mkdirp2.default)(destFolder, (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                                                                                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                                                                                        while (1) {
                                                                                            switch (_context3.prev = _context3.next) {
                                                                                                case 0:
                                                                                                    _context3.next = 2;
                                                                                                    return _this2.writeCertificatesFiles("" + destFolder + _path2.default.sep + preFileName, {
                                                                                                        privateKey: privateKey,
                                                                                                        fullChain: fullChain,
                                                                                                        sans: sans
                                                                                                    });

                                                                                                case 2:

                                                                                                    resolve();

                                                                                                case 3:
                                                                                                case "end":
                                                                                                    return _context3.stop();
                                                                                            }
                                                                                        }
                                                                                    }, _callee3, _this2);
                                                                                })));

                                                                            case 1:
                                                                            case "end":
                                                                                return _context4.stop();
                                                                        }
                                                                    }
                                                                }, _callee4, _this2);
                                                            }));

                                                            return function (_x8, _x9) {
                                                                return _ref6.apply(this, arguments);
                                                            };
                                                        }());

                                                    case 5:
                                                        structuredName = "";

                                                        if (!(_this2.structure === TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED)) {
                                                            _context7.next = 13;
                                                            break;
                                                        }

                                                        structuredName = _path2.default.join(_path2.default.resolve(_this2.destFolder), domain);

                                                        _context7.next = 10;
                                                        return new _promise2.default(function () {
                                                            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(resolve, reject) {
                                                                return _regenerator2.default.wrap(function _callee6$(_context6) {
                                                                    while (1) {
                                                                        switch (_context6.prev = _context6.next) {
                                                                            case 0:

                                                                                (0, _mkdirp2.default)(structuredName, (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                                                                                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                                                                                        while (1) {
                                                                                            switch (_context5.prev = _context5.next) {
                                                                                                case 0:
                                                                                                    _context5.next = 2;
                                                                                                    return _this2.writeCertificatesFiles(structuredName + _path2.default.sep, {
                                                                                                        privateKey: privateKey,
                                                                                                        fullChain: fullChain,
                                                                                                        sans: sans
                                                                                                    });

                                                                                                case 2:
                                                                                                    resolve();

                                                                                                case 3:
                                                                                                case "end":
                                                                                                    return _context5.stop();
                                                                                            }
                                                                                        }
                                                                                    }, _callee5, _this2);
                                                                                })));

                                                                            case 1:
                                                                            case "end":
                                                                                return _context6.stop();
                                                                        }
                                                                    }
                                                                }, _callee6, _this2);
                                                            }));

                                                            return function (_x10, _x11) {
                                                                return _ref8.apply(this, arguments);
                                                            };
                                                        }());

                                                    case 10:
                                                        resolve(destFolder + preFileName + " and " + structuredName);
                                                        _context7.next = 14;
                                                        break;

                                                    case 13:
                                                        resolve(destFolder + preFileName);

                                                    case 14:
                                                    case "end":
                                                        return _context7.stop();
                                                }
                                            }
                                        }, _callee7, _this2);
                                    }));

                                    return function (_x6, _x7) {
                                        return _ref5.apply(this, arguments);
                                    };
                                }()));

                            case 2:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function createStructureAndWriteCertificates(_x4, _x5) {
                return _ref3.apply(this, arguments);
            }

            return createStructureAndWriteCertificates;
        }()
    }, {
        key: "writeCertificatesFiles",
        value: function writeCertificatesFiles(destFolder, params) {
            var _this3 = this;

            return new _promise2.default(function () {
                var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(resolve, reject) {
                    var chain, cert, privateKey, fullChain, start;
                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    chain = void 0, cert = void 0, privateKey = void 0, fullChain = void 0;

                                    if (params.privateKey) {
                                        _context9.next = 3;
                                        break;
                                    }

                                    throw new Error("params privateKey is needed");

                                case 3:
                                    privateKey = Buffer.from(params.privateKey, "base64").toString();

                                    if (params.fullChain) {
                                        _context9.next = 6;
                                        break;
                                    }

                                    throw new Error("params fullChain is needed");

                                case 6:
                                    fullChain = Buffer.from(params.fullChain, "base64").toString();

                                    start = fullChain.substr(1).indexOf("-----BEGIN CERTIFICATE-----");

                                    cert = fullChain.substr(0, start);
                                    chain = fullChain.substr(start);

                                    //write privkey
                                    _context9.next = 12;
                                    return new _promise2.default(function (resolve, reject) {
                                        _fs2.default.writeFile(destFolder + "privkey.pem", privateKey, function (err) {
                                            if (err) reject(err);
                                            resolve();
                                        });
                                    });

                                case 12:
                                    _context9.next = 14;
                                    return new _promise2.default(function (resolve, reject) {
                                        _fs2.default.writeFile(destFolder + "fullchain.pem", fullChain, function (err) {
                                            if (err) reject(err);
                                            resolve();
                                        });
                                    });

                                case 14:
                                    _context9.next = 16;
                                    return new _promise2.default(function (resolve, reject) {
                                        _fs2.default.writeFile(destFolder + "cert.pem", cert, function (err) {
                                            if (err) reject(err);
                                            resolve();
                                        });
                                    });

                                case 16:
                                    _context9.next = 18;
                                    return new _promise2.default(function (resolve, reject) {
                                        _fs2.default.writeFile(destFolder + "chain.pem", chain, function (err) {
                                            if (err) reject(err);
                                            resolve();
                                        });
                                    });

                                case 18:

                                    resolve();

                                    // reject("Test Error !");

                                case 19:
                                case "end":
                                    return _context9.stop();
                            }
                        }
                    }, _callee9, _this3);
                }));

                return function (_x12, _x13) {
                    return _ref10.apply(this, arguments);
                };
            }());
        }
    }, {
        key: "loadAcmeVersion",
        value: function loadAcmeVersion() {
            this.acmeVersion = 1;

            try {
                if (this._acmeData.Account.Registration.uri.match(/acme-v02/gm)) {
                    this.acmeVersion = 2;
                }
            } catch (e) {
                console.error("fail to get acme version for your acme.json");
            }
        }
    }, {
        key: "loadStructure",
        value: function loadStructure(structure) {
            if (structure > TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED || structure < TraefikCertificateExporter.FOLDERS_FLAT) {
                this.structure = TraefikCertificateExporter.FOLDERS_STRUCTURED;
            } else {
                this.structure = structure;
            }
        }
    }]);
    return TraefikCertificateExporter;
}();

TraefikCertificateExporter.FOLDERS_FLAT = 1;
TraefikCertificateExporter.FOLDERS_STRUCTURED = 2;
TraefikCertificateExporter.FOLDERS_FLAT_AND_STRUCTURED = 3;
exports.default = TraefikCertificateExporter;