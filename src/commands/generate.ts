import { ParsedArgs } from "minimist";
import { getTableColumns, getTables } from "../services/tables"
import mssql from 'mssql'
import { render } from "mustache";
import { transformType } from "../utils/transformSql";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { table } from "../model/table";

export function generate(args: ParsedArgs) {  
  return new Promise((resolve, reject) =>{
    if (args.url) {
      console.log('Generating API...')
      mssql.connect(args.url)
      .then(async () => {
        try {
          const tables = await getTables(mssql)
          console.log(await generateModel(mssql, tables))
          console.log(await generateController(mssql, tables))
        } catch (error) {
          reject(error)
        }
      })
      .catch(err => reject(err))
    } else {
      reject(new Error('Missing "url" option'))
    }
  })
}

function generateModel(dbClient, tables: table[]): Promise<boolean | undefined> {
  return new Promise((resolve, reject) => {
    const interfaceViews = tables.map(async t => {
      const view = {
        name: t.TABLE_NAME.replace(/[\W]+/g, ''),
        fields: (await getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA)).map(a => {
          return {
            name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
            optional: a.IS_NULLABLE === 'NO',
            type: transformType(a.DATA_TYPE)
          }
        })
      }
      return view
    })

    Promise.all(interfaceViews)
    .then(views => {
      for (const view of views) {
        const path = `${process.cwd()}\\model`
        const template = readFileSync(join(__dirname, '/../templates/_interface.ts.hbs'), 'utf8')

        mkdirSync(path, {recursive: true})
        writeFileSync(`${path}\\${view.name}.ts`, render(template, view), 'utf8')
        console.log(`${chalk.yellow('Model:')} ${view.name}.ts`)
      }
      resolve(true)
    }).catch(err => {throw err})
  })
}

function generateController(dbClient, tables: table[]): Promise<boolean | undefined> {
  return new Promise(async (resolve, reject) => {
    const controllerViews = tables.map(async t => {
      const fields = await getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA)
      const view = {
        name: t.TABLE_NAME.replace(/[\W]+/g, ''),
        schema: t.TABLE_SCHEMA,
        firstField: fields[0].COLUMN_NAME,
        fields: fields.map((a, i) => {
          return {
            name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
            comma: i !== (fields.length - 1)
          }
        })
      }
      return view
    })

    Promise.all(controllerViews)
    .then(views => {
      for (const view of views) {
        const path = `${process.cwd()}\\controllers`
        const template = readFileSync(join(__dirname, '/../templates/_controller.ts.hbs'), 'utf8')

        mkdirSync(path, {recursive: true})
        writeFileSync(`${path}\\${view.name}.ts`, render(template, view), 'utf8')
        console.log(`${chalk.yellow('Controller:')} ${view.name}.ts`)
      }
      resolve(true)
    }).catch(err => {throw err})
  })
}