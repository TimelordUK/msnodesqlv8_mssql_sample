const { SCHEMA } = require('../lib/db')

// For large results, stream rows instead of buffering the whole recordset in memory.
module.exports = async function streaming(pool) {
    // 1. as an async iterable - toReadableStream() applies back pressure while each row is processed
    const request = pool.request()
    const rows = request.toReadableStream()
    request.query(`SELECT Id, Name, Salary FROM ${SCHEMA}.Employees ORDER BY Id`)

    let count = 0
    let total = 0
    for await (const row of rows) {
        count++
        total += row.Salary
    }
    console.log(`streamed ${count} rows, payroll ${total.toFixed(2)}`)

    // 2. with events, pausing and resuming by hand
    await new Promise((resolve, reject) => {
        const req = pool.request()
        req.stream = true
        let seen = 0
        req.on('recordset', columns => console.log('columns:', Object.keys(columns).join(', ')))
        req.on('row', () => {
            if (++seen % 2500 === 0) {
                req.pause() // e.g. while a batch is written somewhere slow
                setTimeout(() => req.resume(), 10)
            }
        })
        req.on('error', reject)
        req.on('done', () => {
            console.log(`event stream saw ${seen} rows`)
            resolve()
        })
        req.query(`SELECT Id, Name FROM ${SCHEMA}.Employees`)
    })
}
