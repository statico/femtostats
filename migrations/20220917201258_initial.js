const { randomBytes } = require("crypto");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex.schema
    .createTable("sites", (t) => {
      t.increments("id").primary();
      t.text("name");
      t.text("hostnames");
      t.text("token").unique();
    })
    .createTable("events", (t) => {
      t.integer("timestamp").index();
      t.integer("site_id").references("sites.id").index();
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
      t.integer("site_id").references("site.id").index();
      t.text("user_id");
      t.integer("started_at").index();
      t.integer("ended_at").index();
    });

  await knex.into("sites").insert({
    id: 1,
    name: "My Cool Site",
    hostnames: "example.com,*.example.com",
    token: randomBytes(4).toString("hex"),
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTable("sessions").dropTable("events");
};
