import pluginJs from "@eslint/js";
import globals from "globals";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      "no-unused-vars": "warn", // 사용하지 않는 변수 경고 
      "no-console": "off", // console.log 허용 
      "semi": ["error", "always"], // 세미콜론 강제
      "curly": "error" // 모든 제어문에 블럭 `{}` 강제 
    }
  },
  pluginJs.configs.recommended,
];