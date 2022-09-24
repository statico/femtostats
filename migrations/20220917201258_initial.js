/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  return knex.schema
    .createTable("events", (t) => {
      t.integer("timestamp").index();
      t.text("session_id").references("sessions.id").index();
      t.text("name").index();
      t.text("hostname").index();
      t.text("pathname").index();
      t.text("referrer").index();
      t.text("browser");
      t.text("browser_version");
      t.text("os");
      t.text("os_version");
      t.text("country");
      t.integer("screen_width");
    })
    .createTable("sessions", (t) => {
      t.text("id").primary();
      t.text("user_id");
      t.text("hostname");
      t.integer("started_at").index();
      t.integer("ended_at").index();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTable("sessions").dropTable("events");
};