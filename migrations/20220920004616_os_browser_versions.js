/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.text("browser_version").index();
    t.text("os_version").index();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.dropColumn("browser_version");
    t.dropColumn("os_version");
  });
};
