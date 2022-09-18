import knex, { Knex } from "knex"

const knexConfig = require("../knexfile")

let db: Knex

// Workaround for hot module reload opening too many connections
if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  if (!global.__knex) {
    // @ts-ignore
    global.__knex = knex({ ...knexConfig, asyncStackTraces: true })
  }
  // @ts-ignore
  db = global.__knex
} else {
  db = knex(knexConfig)
}

export default db
