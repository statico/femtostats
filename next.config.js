module.exports = {
  output: "standalone",

  // Disable static optimization to avoid Chakra UI v3 SSR issues
  experimental: {
    isrMemoryCacheSize: 0,
  },

  async rewrites() {
    return [
      {
        source: "/data.js",
        destination: "/script.js",
      },
    ];
  },
};
