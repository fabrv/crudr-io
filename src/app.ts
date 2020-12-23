import chalk from "chalk";
import minimist, { ParsedArgs } from "minimist";
import pjson from '../package.json'
import { generate } from "./commands/generate";

export class crudrio {
  args: ParsedArgs = minimist(process.argv.slice(2))
  constructor() {
    let cmd = this.args._[0] || 'error'
    
    if (this.args.version || this.args.v) {
      cmd = 'version'
    }

    switch (cmd) {
      case 'generate':
        generate(this.args)
        .then(data => console.log(data))
        .catch(err => console.error('⚠️  Error: ' + chalk.red(err.message)))
        break
      case 'version':
        console.log('crudr.io ' + chalk.blue(pjson.version))
        break
      case 'error':
      default:
        console.log('Unknwon or missing option(s)')
        break
    }
  }
}