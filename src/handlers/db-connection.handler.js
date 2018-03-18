const EventEmitter = require('events')
const Sequelize = require('sequelize')

module.exports = class DbConnectionHandler extends EventEmitter {
  constructor({ dialect, host, port, database, username, password }) {
    super()

    this.dialect = dialect

    this.conn = new Sequelize({
      dialect,
      host,
      port,
      database,
      username,
      password,
      pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      operatorsAliases: false,
      dialectOptions: {
        multipleStatements: true
      }
    })
  }

  async authenticate() {
    const authResult = await this.conn.authenticate()
    console.log(this.dialect)
    console.log('xxx')
    if (this.dialect === 'postgres') {
      const queryTables =
        'SELECT ' +
        'a.schema_name AS name, ' +
        '(SELECT ARRAY_TO_JSON(ARRAY_AGG(t)) FROM (SELECT b.tablename AS name FROM pg_tables AS b WHERE b.schemaname=a.schema_name) AS t) AS tables, ' +
        '(SELECT ARRAY_TO_JSON(ARRAY_AGG(t)) FROM (SELECT b.viewname AS name FROM pg_views AS b WHERE b.schemaname=a.schema_name) AS t) AS views ' +
        'FROM ' +
        'information_schema.schemata AS a'

      this.query({ query: queryTables, type: 'explorer', ref: 'explorer' })

      // SELECT SCHEMA_NAME AS `Database` FROM INFORMATION_SCHEMA.SCHEMATA

      // SELECT TABLE_NAME
      // FROM INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='mysql';

      // SELECT COLUMN_NAME
      //     FROM INFORMATION_SCHEMA.COLUMNS
      //     WHERE TABLE_SCHEMA='mysql' AND table_name='test';
    }

    // this.explorer({ request: 'schemas' })
    // this.explorer({ request: 'tables', schema: 'mysql' })
    // this.explorer({ request: 'tableDetail', schema: 'mysql', table: 'test' })

    return authResult
  }

  // explore({ request, schema, table }) {
  //   if (this.dialect === 'mysql') {
  //     if (request === 'schemas') {
  //       const query = 'SELECT schema_name FROM information_schema.schemata ORDER BY schema_name'
  //       this.query({ query, type: 'schemas' })
  //     } else if (request === 'tables') {
  //       query = `SELECT table_name FROM information_schema.tables WHERE table_schema='${schema}' ` +
  //         'ORDER BY table_name'
  //       this.query({ query, type: 'tables' })
  //     } else if (request === 'tableDetail')
  //   }
  // }

  query({ ref, query, type = 'query-result' }) {
    const payload = {
      ref,
      type,
      content: undefined
    }

    console.log(`type: ${type}`)

    this.conn.query(query).spread((results, metadata) => {
      if (!results && metadata) results = metadata
      payload.content = results
    }).catch((err) => {
      payload.query = 'query-error'
      payload.content = err.message
    }).finally(() => {
      this.emit('payload', payload)
    })
  }

  close() {
    return this.conn.close()
  }
}
