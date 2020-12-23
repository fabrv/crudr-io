import { ParsedArgs } from "minimist";
import { getTables } from "../controller/tables"
import mssql from 'mssql'

export function generate(args: ParsedArgs) {  
  return new Promise((resolve, reject) =>{
    if (args.url) {
      console.log('Generating API...')
      mssql.connect(args.url)
      .then(async () => console.log(await getTables(mssql)))
      .catch(err => reject(err))
    } else {
      reject(new Error('Missing "url" option'))
    }
  })
}