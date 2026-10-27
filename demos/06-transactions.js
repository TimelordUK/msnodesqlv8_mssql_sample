const { mssql, SCHEMA } = require('../lib/db')

async function headcount(pool) {
    const r = await pool.query(`SELECT COUNT(*) AS n FROM ${SCHEMA}.Employees`)
    return r.recordset[0].n
}

// Requests created from a Transaction all run on its one connection.
module.exports = async function transactions(pool) {
    console.log('before:', await headcount(pool))

    // commit
    const tx = new mssql.Transaction(pool)
    await tx.begin()
    try {
        await new mssql.Request(tx).query(`
            INSERT INTO ${SCHEMA}.Employees (Name, Department, Salary, HiredOn)
            VALUES ('Grace Hopper', 'Engineering', 130000, '2021-06-01')`)
        await tx.commit()
    } catch (err) {
        await tx.rollback()
        throw err
    }
    console.log('after commit:', await headcount(pool))

    // rollback - the second insert breaks the UNIQUE constraint on Name, so neither row is kept
    const tx2 = new mssql.Transaction(pool)
    await tx2.begin(mssql.ISOLATION_LEVEL.READ_COMMITTED)
    try {
        const insert = `INSERT INTO ${SCHEMA}.Employees (Name, Department, Salary, HiredOn)
                        VALUES (@name, 'Sales', 50000, '2022-01-01')`
        await new mssql.Request(tx2).input('name', mssql.NVarChar(100), 'Alan Turing').query(insert)
        await new mssql.Request(tx2).input('name', mssql.NVarChar(100), 'Alan Turing').query(insert)
        await tx2.commit()
    } catch (err) {
        console.log('rolling back:', err.message)
        await tx2.rollback()
    }
    console.log('after rollback:', await headcount(pool))
}
