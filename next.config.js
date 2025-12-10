module.exports = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/data.js",
        destination: "/script.js",
      },
    ];
  },
};
