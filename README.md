# crudr.io
Automatically generate REST APIs from a SQL Server Database.

## Use
1. Generate the API
```bash
npx crudrio --url "mssql://user:password@localhost/database" --name "crudrio-api"
```
2. Enter project directory and install dependencies
```bash
cd crudrio-api
npm i
```

3. Start project
```bash
npm run watch
```
