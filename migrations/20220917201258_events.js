/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  return knex.schema.createTable("events", (t) => {
    t.integer("timestamp").index();
    t.text("name").notNullable().index();
    t.text("hostname").index();
    t.text("pathname").index();
    t.text("referrer").index();
    t.text("browser").index();
    t.text("os").index();
    t.integer("screen_width").index();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.dropTable("events");
};
