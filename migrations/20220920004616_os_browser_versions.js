exports.up = (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.text("browser_version").index();
    t.text("os_version").index();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable("events", (t) => {
    t.dropColumn("browser_version");
    t.dropColumn("os_version");
  });
};
