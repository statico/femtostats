/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  return knex.schema
    .createTable("sessions", (t) => {
      t.text("id").primary();
      t.text("hostname").index();
      t.integer("started_at").index();
      t.integer("ended_at").index();
    })
    .alterTable("events", (t) => {
      t.text("session_id").references("sessions.id").index();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema
    .alterTable("events", (t) => {
      t.dropColumn("session_id");
    })
    .dropTable("sessions");
};
