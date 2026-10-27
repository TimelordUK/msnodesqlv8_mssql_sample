const mssql = require('mssql/msnodesqlv8')

// Override with MSSQL_CONNECTION_STRING, e.g. for LocalDB:
//   Driver={ODBC Driver 18 for SQL Server};Server=(localdb)\MSSQLLocalDB;Database=scratch;Trusted_Connection=yes;
const connectionString = process.env.MSSQL_CONNECTION_STRING ||
    'Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;Connect Timeout=10'

// every object the demos create lives in this schema, so dropping it leaves the database as it was
const SCHEMA = 'mssql_demo'

const config = {
    connectionString,
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
}

async function createSchema(pool) {
    await pool.request()
        .input('schema', mssql.NVarChar, SCHEMA)
        .query(`IF SCHEMA_ID(@schema) IS NULL EXEC('CREATE SCHEMA ' + @schema)`)
}

// drops the procedures, functions, views, tables and table types in the demo schema, then the schema
async function dropSchema(pool) {
    await pool.request()
        .input('schema', mssql.NVarChar, SCHEMA)
        .query(`
            IF SCHEMA_ID(@schema) IS NULL RETURN

            DECLARE @sql NVARCHAR(MAX)

            SELECT @sql = STRING_AGG(CAST(
                       'DROP ' + CASE o.type WHEN 'U' THEN 'TABLE' WHEN 'V' THEN 'VIEW' WHEN 'P' THEN 'PROCEDURE' ELSE 'FUNCTION' END
                       + ' ' + QUOTENAME(@schema) + '.' + QUOTENAME(o.name) AS NVARCHAR(MAX)), ';')
                   WITHIN GROUP (ORDER BY CASE o.type WHEN 'U' THEN 2 ELSE 1 END)
            FROM sys.objects o
            WHERE o.schema_id = SCHEMA_ID(@schema) AND o.type IN ('U', 'V', 'P', 'FN', 'IF', 'TF')
            IF @sql IS NOT NULL EXEC sp_executesql @sql

            SET @sql = NULL
            SELECT @sql = STRING_AGG(CAST('DROP TYPE ' + QUOTENAME(@schema) + '.' + QUOTENAME(t.name) AS NVARCHAR(MAX)), ';')
            FROM sys.types t
            WHERE t.schema_id = SCHEMA_ID(@schema) AND t.is_user_defined = 1
            IF @sql IS NOT NULL EXEC sp_executesql @sql

            EXEC('DROP SCHEMA ' + @schema)
        `)
}

module.exports = { mssql, config, SCHEMA, createSchema, dropSchema }
