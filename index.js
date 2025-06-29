const mssql= require('mssql/msnodesqlv8')
const {runQuery} = require("./query");
const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;Connect Timeout=10";


async function runner() {
    const res = await runQuery(mssql, connectionString, 'select top 3 * from syscolumns')
    console.log(JSON.stringify(res, null, 4))
}

runner().then(() => {
    console.log('done')
})


