# msnodesqlv8 + mssql sample

Short, runnable examples of the [mssql](https://www.npmjs.com/package/mssql) API using the
[msnodesqlv8](https://www.npmjs.com/package/msnodesqlv8) ODBC driver (`require('mssql/msnodesqlv8')`).

```
npm install
npm start          # all demos, CommonJS
npm run mjs        # minimal ES module example
```

Set `MSSQL_CONNECTION_STRING` to point at your server; the default is in [lib/db.js](lib/db.js).
The login needs permission to create a schema, tables, types and procedures.

## Demos

| File | Shows |
| --- | --- |
| [01-connect](demos/01-connect.js) | one shared `ConnectionPool`, a simple query |
| [02-parameters](demos/02-parameters.js) | typed `request.input`, `OUTPUT INSERTED`, tagged template queries |
| [03-bulk-insert](demos/03-bulk-insert.js) | `mssql.Table` + `request.bulk()` – 10,000 rows |
| [04-tvp](demos/04-tvp.js) | table-valued parameter passed to a stored procedure |
| [05-stored-procedure](demos/05-stored-procedure.js) | `execute` with inputs, outputs, return value and a recordset |
| [06-transactions](demos/06-transactions.js) | commit, and rollback after a failed statement |
| [07-prepared-statement](demos/07-prepared-statement.js) | prepare once, execute many, `unprepare` |
| [08-streaming](demos/08-streaming.js) | `for await` over `toReadableStream()`, and `row` events with pause/resume |
| [09-multiple-recordsets](demos/09-multiple-recordsets.js) | several result sets from one batch, `arrayRowMode` |
| [10-errors](demos/10-errors.js) | `RequestError` numbers, `THROW`, cancelling a request |

## Cleanup

Everything is created in the `mssql_demo` schema. The runner drops that schema and all of its
objects when it finishes, fails or is interrupted with Ctrl-C, and also at start-up in case an
earlier run was killed – so nothing is left behind in your database.
