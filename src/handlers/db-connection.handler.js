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

      this.query({ query: queryTables, type: 'explorer' })
    }

    return authResult
  }

  query({ query, type = 'query-result' }) {
    const payload = {
      type: type,
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
