# crudr.io
Automatically generate REST APIs from a SQL Server Database.

## Use
1. Install globally and generate the API
```bash
npm i crudrio -g
crudrio --url "mssql://user:password@localhost/database" --name "crudrio-api"
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


## Roadmap
1. Controller improvements for inserts
2. PostgreSQL and MySQL integrations
3. Help option in CLI