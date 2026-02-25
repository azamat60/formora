import base from "./base.js";

export default {
  ...base,
  rules: {
    ...base.rules,
    "@next/next/no-html-link-for-pages": "off"
  }
};
