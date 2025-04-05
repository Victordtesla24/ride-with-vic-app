module.exports = {
  extends: ["next"],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  ignorePatterns: ["node_modules/**", ".husky/**", ".git/**"],
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
    "no-duplicate-imports": ["error", { "includeExports": true }]
  },
  overrides: [
    // Specific rules for components
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
  ]
} 