export default [
  {
    ignores: ["node_modules/**", ".husky/**", ".git/**"]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
        console: "readonly",
        module: "readonly",
        process: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      // Enforce proper import paths
      "no-restricted-imports": [
        "error", 
        {
          "patterns": [
            {
              "group": ["./components/*", "../components/*", "../../components/*"],
              "message": "Import from proper component directory. Example: 'components/trip/TripCard'"
            },
            {
              "group": ["./lib/*", "../lib/*", "../../lib/*"],
              "message": "Import from proper lib directory. Example: 'lib/tesla-api'"
            },
            {
              "group": ["./models/*", "../models/*", "../../models/*"],
              "message": "Import from proper models directory. Example: 'models/trip'"
            },
            {
              "group": ["./api/*", "../api/*", "../../api/*"],
              "message": "Import from proper API directory. Example: 'api/vehicle/location'"
            }
          ]
        }
      ],
      // Prevents creating files with the same name
      "no-duplicate-imports": ["error"]
    }
  },
  {
    files: ["components/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../api/*", "../../api/*", "../../../api/*"],
              "message": "Components should not import directly from API. Use lib/ utilities instead."
            }
          ]
        }
      ]
    }
  }
]; 