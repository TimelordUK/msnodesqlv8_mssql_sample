const mssql= require('mssql/msnodesqlv8')
const {runQuery} = require("./query");
const connectionString  = "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\node;Database=scratch;Trusted_Connection=yes;"

async function runner() {
    const res = await runQuery(mssql, connectionString, 'select top 3 * from syscolumns')
    console.log(JSON.stringify(res, null, 4))
}

runner().then(() => {
    console.log('done')
})


