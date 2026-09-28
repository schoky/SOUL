const prettier = require("@schoky/prettier");

module.exports = {
  ...prettier,
  plugins: [...(prettier.plugins || []), "prettier-plugin-prisma"],
  overrides: [
    ...(prettier.overrides || []),
    {
      files: "*.prisma",
      options: { parser: "prisma-language-server" },
    },
  ],
};
