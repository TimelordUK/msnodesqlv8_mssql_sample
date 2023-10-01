const sql= require('mssql/msnodesqlv8')
const connectionString  = "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\node;Database=scratch;Trusted_Connection=yes;"

const config = {
    connectionString: connectionString
}

async function runner() {
    const pool = await sql.connect(config)
    const res = await pool.query('select top 3 * from syscolumns')
    console.log(JSON.stringify(res, null, 4))
    await pool.close()
}

runner().then(() => {
    console.log('done')
})


