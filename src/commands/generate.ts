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
  args.name = args.name != null ? args.name.replace(/[\W_]+/g, '-') : 'crudrio-api'
  return new Promise((resolve, reject) =>{
    if (args.url) {
      console.log('Generating API...')
      mssql.connect(args.url)
      .then(async () => {
        try {
          const tables = await getTables(mssql)
          generateStructure(args.name, args.description, args.url, tables, args.author)
          console.log(await generateModel(mssql, tables, args.name) ? `✅  ${chalk.green('Generated models')}` : `⛔  ${chalk.red('Failed to generate models')}`)
          console.log(await generateController(mssql, tables, args.name) ? `✅  ${chalk.green('Generated controllers')}` : `⛔  ${chalk.red('Failed to generate controllers')}`)
          console.log(await generateRoute(mssql, tables, args.name) ? `✅  ${chalk.green('Generated routes')}` : `⛔  ${chalk.red('Failed to generate routes')}`)
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

function generateStructure(apiName: string, apiDescription: string, dbUrl: string, tables: table[], author?: string): Promise<boolean | undefined> {
  return new Promise((resolve, reject) => {
    try {
      const path = `${process.cwd()}\\${apiName}`
      mkdirSync(path, {recursive: true})
      mkdirSync(`${path}\\src`, {recursive: true})

      writeFileSync(`${path}\\tsconfig.json`, readFileSync(join(__dirname, '/../templates/_tsconfig.json.hbs'), 'utf8'), 'utf8')
      writeFileSync(`${path}\\.gitignore`, readFileSync(join(__dirname, '/../templates/_gitignore.hbs'), 'utf8'), 'utf8')
      writeFileSync(`${path}\\src\\index.ts`, readFileSync(join(__dirname, '/../templates/_index.ts.hbs'), 'utf8'), 'utf8')
      
      const pjsonTemplate = readFileSync(join(__dirname, '/../templates/_package.json.hbs'), 'utf8')
      const pjson = render(pjsonTemplate, {
        name: apiName,
        description: apiDescription,
        author: author
      })
      writeFileSync(`${path}\\package.json`, pjson, 'utf8')

      const appTemplate = readFileSync(join(__dirname, '/../templates/_app.ts.hbs'), 'utf8')
      const appTables = tables.map(t => {
        const view = {
          name: t.TABLE_NAME.replace(/[\W]+/g, '')
        }
        return view
      })
      const app = render(appTemplate, {
        tables: appTables,
        databaseUrl: dbUrl
      })
      writeFileSync(`${path}\\src\\app.ts`, app, 'utf8')

      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

function generateModel(dbClient, tables: table[], apiName: string): Promise<boolean | undefined> {
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
        const path = `${process.cwd()}\\${apiName}\\src\\model`
        const template = readFileSync(join(__dirname, '/../templates/_interface.ts.hbs'), 'utf8')

        mkdirSync(path, {recursive: true})
        writeFileSync(`${path}\\${view.name}.ts`, render(template, view), 'utf8')
        console.log(`${chalk.yellow('Model:')} ${view.name}.ts`)
      }
      resolve(true)
    }).catch(err => {throw err})
  })
}

function generateController(dbClient, tables: table[], apiName: string): Promise<boolean | undefined> {
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
        const path = `${process.cwd()}\\${apiName}\\src\\controllers`
        const template = readFileSync(join(__dirname, '/../templates/_controller.ts.hbs'), 'utf8')

        mkdirSync(path, {recursive: true})
        writeFileSync(`${path}\\${view.name}.ts`, render(template, view), 'utf8')
        console.log(`${chalk.yellow('Controller:')} ${view.name}.ts`)
      }
      resolve(true)
    }).catch(err => {throw err})
  })
}

function generateRoute(dbClient, tables: table[], apiName: string): Promise<boolean | undefined> {
  return new Promise(async (resolve, reject) => {
    const routeViews = tables.map(async t => {
      const fields = await getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA)
      const view = {
        name: t.TABLE_NAME.replace(/[\W]+/g, ''),
        fields: fields.map((a, i) => {
          return {
            name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
            comma: i !== (fields.length - 1)
          }
        })
      }
      return view
    })

    Promise.all(routeViews)
    .then(views => {
      for (const view of views) {
        const path = `${process.cwd()}\\${apiName}\\src\\routes`
        const template = readFileSync(join(__dirname, '/../templates/_route.ts.hbs'), 'utf8')

        mkdirSync(path, {recursive: true})
        writeFileSync(`${path}\\${view.name}.ts`, render(template.replace(/\\n/g, '\n'), view), 'utf8')
        console.log(`${chalk.yellow('Routes:')} ${view.name}.ts`)
      }
      resolve(true)
    }).catch(err => {throw err})
  })
}