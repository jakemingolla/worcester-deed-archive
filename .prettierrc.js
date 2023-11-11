const config = {
  overrides: [
    {
      // Only sort imports on src files to avoid Jest mock hoisting issues.
      files: "src/**/*.ts",
      options: {
        importOrder: [
          "./tracer",
          "^core/(.*)$",
          "^@server/(.*)$",
          "^@ui/(.*)$",
          "^[./]",
        ],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        plugins: ["@trivago/prettier-plugin-sort-imports"],
      },
    },
  ],
};

export default config;
