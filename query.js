async function runQuery(mssql, connectionString, sqlString) {
    const config = {
        connectionString: connectionString
    }

    const pool = await mssql.connect(config)
    const res = await pool.query(sqlString)
    await pool.close()
    return res
}

async function executeProcedure(mssql, connectionString, procedureName, params = {}) {
    const config = {
        connectionString: connectionString
    }

    const pool = await mssql.connect(config)
    const request = pool.request()
    
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value)
    }
    
    request.output('Result', mssql.Int)
    
    const res = await request.execute(procedureName)
    await pool.close()
    return res
}

exports.runQuery = runQuery
exports.executeProcedure = executeProcedure