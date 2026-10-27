const { mssql, config, createSchema, dropSchema } = require('./lib/db')

// run in order - later demos use the Employees table created and filled by 02 and 03
const demos = [
    require('./demos/01-connect'),
    require('./demos/02-parameters'),
    require('./demos/03-bulk-insert'),
    require('./demos/04-tvp'),
    require('./demos/05-stored-procedure'),
    require('./demos/06-transactions'),
    require('./demos/07-prepared-statement'),
    require('./demos/08-streaming'),
    require('./demos/09-multiple-recordsets'),
    require('./demos/10-errors')
]

async function main() {
    const pool = new mssql.ConnectionPool(config)
    pool.on('error', err => console.error('pool error', err))
    await pool.connect()

    // ctrl-c still cleans up
    process.once('SIGINT', async () => {
        console.log('\ninterrupted - cleaning up')
        await dropSchema(pool).catch(() => {})
        await pool.close()
        process.exit(130)
    })

    try {
        await dropSchema(pool) // leftovers from a run that was killed
        await createSchema(pool)
        for (const demo of demos) {
            console.log(`\n=== ${demo.name} ===`)
            await demo(pool)
        }
    } finally {
        await dropSchema(pool)
        console.log('\ndemo schema dropped')
        await pool.close()
    }
}

main().catch(err => {
    console.error(err)
    process.exitCode = 1
})
