exports.up = (knex) => {
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

exports.down = (knex) => {
  return knex.schema.dropTable("events");
};
