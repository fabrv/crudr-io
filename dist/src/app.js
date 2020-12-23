"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crudrio = void 0;
const chalk_1 = __importDefault(require("chalk"));
const minimist_1 = __importDefault(require("minimist"));
const package_json_1 = __importDefault(require("../package.json"));
const generate_1 = require("./commands/generate");
class crudrio {
    constructor() {
        this.args = minimist_1.default(process.argv.slice(2));
        let cmd = this.args._[0] || 'error';
        if (this.args.version || this.args.v) {
            cmd = 'version';
        }
        switch (cmd) {
            case 'generate':
                generate_1.generate(this.args)
                    .then(data => console.log(data))
                    .catch(err => console.error('⚠️  Error: ' + chalk_1.default.red(err.message)));
                break;
            case 'version':
                console.log('crudr.io ' + chalk_1.default.blue(package_json_1.default.version));
                break;
            case 'error':
            default:
                console.log('Unknwon or missing option(s)');
                break;
        }
    }
}
exports.crudrio = crudrio;
//# sourceMappingURL=app.js.map