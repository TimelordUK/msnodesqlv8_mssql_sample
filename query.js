async function runQuery(mssql, connectionString, sqlString) {
    const config = {
        connectionString: connectionString
    }

    const pool = await mssql.connect(config)
    const res = await pool.query(sqlString)
    await pool.close()
    return res
}

exports.runQuery = runQuery