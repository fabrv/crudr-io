"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const tables_1 = require("../services/tables");
const mssql_1 = __importDefault(require("mssql"));
const mustache_1 = require("mustache");
const transformSql_1 = require("../utils/transformSql");
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
function generate(args) {
    args.name = args.name != null ? args.name.replace(/[\W_]+/g, '-') : 'crudrio-api';
    return new Promise((resolve, reject) => {
        if (args.url) {
            console.log('Generating API...');
            mssql_1.default.connect(args.url)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const tables = yield tables_1.getTables(mssql_1.default);
                    generateStructure(args.name, args.description, args.url, tables, args.author);
                    console.log((yield generateModel(mssql_1.default, tables, args.name)) ? `✅  ${chalk_1.default.green('Generated models')}` : `⛔  ${chalk_1.default.red('Failed to generate models')}`);
                    console.log((yield generateController(mssql_1.default, tables, args.name)) ? `✅  ${chalk_1.default.green('Generated controllers')}` : `⛔  ${chalk_1.default.red('Failed to generate controllers')}`);
                    console.log((yield generateRoute(mssql_1.default, tables, args.name)) ? `✅  ${chalk_1.default.green('Generated routes')}` : `⛔  ${chalk_1.default.red('Failed to generate routes')}`);
                }
                catch (error) {
                    reject(error);
                }
            }))
                .catch(err => reject(err));
        }
        else {
            reject(new Error('Missing "url" option'));
        }
    });
}
exports.generate = generate;
function generateStructure(apiName, apiDescription, dbUrl, tables, author) {
    return new Promise((resolve, reject) => {
        try {
            const path = `${process.cwd()}\\${apiName}`;
            fs_1.mkdirSync(path, { recursive: true });
            fs_1.mkdirSync(`${path}\\src`, { recursive: true });
            fs_1.writeFileSync(`${path}\\tsconfig.json`, fs_1.readFileSync(path_1.join(__dirname, '/../templates/_tsconfig.json.hbs'), 'utf8'), 'utf8');
            fs_1.writeFileSync(`${path}\\.gitignore`, fs_1.readFileSync(path_1.join(__dirname, '/../templates/_gitignore.hbs'), 'utf8'), 'utf8');
            fs_1.writeFileSync(`${path}\\src\\index.ts`, fs_1.readFileSync(path_1.join(__dirname, '/../templates/_index.ts.hbs'), 'utf8'), 'utf8');
            const pjsonTemplate = fs_1.readFileSync(path_1.join(__dirname, '/../templates/_package.json.hbs'), 'utf8');
            const pjson = mustache_1.render(pjsonTemplate, {
                name: apiName,
                description: apiDescription,
                author: author
            });
            fs_1.writeFileSync(`${path}\\package.json`, pjson, 'utf8');
            const appTemplate = fs_1.readFileSync(path_1.join(__dirname, '/../templates/_app.ts.hbs'), 'utf8');
            const appTables = tables.map(t => {
                const view = {
                    name: t.TABLE_NAME.replace(/[\W]+/g, '')
                };
                return view;
            });
            const app = mustache_1.render(appTemplate, {
                tables: appTables,
                databaseUrl: dbUrl
            });
            fs_1.writeFileSync(`${path}\\src\\app.ts`, app, 'utf8');
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    });
}
function generateModel(dbClient, tables, apiName) {
    return new Promise((resolve, reject) => {
        const interfaceViews = tables.map((t) => __awaiter(this, void 0, void 0, function* () {
            const view = {
                name: t.TABLE_NAME.replace(/[\W]+/g, ''),
                fields: (yield tables_1.getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA)).map(a => {
                    return {
                        name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
                        optional: a.IS_NULLABLE === 'NO',
                        type: transformSql_1.transformType(a.DATA_TYPE)
                    };
                })
            };
            return view;
        }));
        Promise.all(interfaceViews)
            .then(views => {
            for (const view of views) {
                const path = `${process.cwd()}\\${apiName}\\src\\model`;
                const template = fs_1.readFileSync(path_1.join(__dirname, '/../templates/_interface.ts.hbs'), 'utf8');
                fs_1.mkdirSync(path, { recursive: true });
                fs_1.writeFileSync(`${path}\\${view.name}.ts`, mustache_1.render(template, view), 'utf8');
                console.log(`${chalk_1.default.yellow('Model:')} ${view.name}.ts`);
            }
            resolve(true);
        }).catch(err => { throw err; });
    });
}
function generateController(dbClient, tables, apiName) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const controllerViews = tables.map((t) => __awaiter(this, void 0, void 0, function* () {
            const fields = yield tables_1.getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA);
            const view = {
                name: t.TABLE_NAME.replace(/[\W]+/g, ''),
                schema: t.TABLE_SCHEMA,
                firstField: fields[0].COLUMN_NAME,
                fields: fields.map((a, i) => {
                    return {
                        name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
                        comma: i !== (fields.length - 1)
                    };
                })
            };
            return view;
        }));
        Promise.all(controllerViews)
            .then(views => {
            for (const view of views) {
                const path = `${process.cwd()}\\${apiName}\\src\\controllers`;
                const template = fs_1.readFileSync(path_1.join(__dirname, '/../templates/_controller.ts.hbs'), 'utf8');
                fs_1.mkdirSync(path, { recursive: true });
                fs_1.writeFileSync(`${path}\\${view.name}.ts`, mustache_1.render(template, view), 'utf8');
                console.log(`${chalk_1.default.yellow('Controller:')} ${view.name}.ts`);
            }
            resolve(true);
        }).catch(err => { throw err; });
    }));
}
function generateRoute(dbClient, tables, apiName) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const routeViews = tables.map((t) => __awaiter(this, void 0, void 0, function* () {
            const fields = yield tables_1.getTableColumns(dbClient, t.TABLE_NAME, t.TABLE_SCHEMA);
            const view = {
                name: t.TABLE_NAME.replace(/[\W]+/g, ''),
                fields: fields.map((a, i) => {
                    return {
                        name: a.COLUMN_NAME.replace(/[\W]+/g, ''),
                        comma: i !== (fields.length - 1)
                    };
                })
            };
            return view;
        }));
        Promise.all(routeViews)
            .then(views => {
            for (const view of views) {
                const path = `${process.cwd()}\\${apiName}\\src\\routes`;
                const template = fs_1.readFileSync(path_1.join(__dirname, '/../templates/_route.ts.hbs'), 'utf8');
                fs_1.mkdirSync(path, { recursive: true });
                fs_1.writeFileSync(`${path}\\${view.name}.ts`, mustache_1.render(template.replace(/\\n/g, '\n'), view), 'utf8');
                console.log(`${chalk_1.default.yellow('Routes:')} ${view.name}.ts`);
            }
            resolve(true);
        }).catch(err => { throw err; });
    }));
}
//# sourceMappingURL=generate.js.map