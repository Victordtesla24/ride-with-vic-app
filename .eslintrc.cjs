module.exports = {
  extends: ["next", "eslint:recommended", "plugin:react/recommended"],
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  ignorePatterns: ["node_modules/**", ".husky/**", ".git/**"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react", "@babel/preset-env"],
      plugins: ["@babel/plugin-syntax-jsx"]
    }
  },
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      },
      alias: {
        map: [
          ["lib", "./lib"],
          ["models", "./models"],
          ["components", "./components"],
          ["api", "./api"],
          ["styles", "./styles"],
          ["public", "./public"]
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  plugins: ["react", "react-hooks", "import"],
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
    "no-duplicate-imports": ["error", { "includeExports": true }],
    // Disable specific rules that might cause issues with ES modules and JSX
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/prop-types": "off",
    // Fix react hooks exhaustive deps warnings
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    'import/no-anonymous-default-export': 'off',
    
    // Only allow critical errors
    'no-unused-vars': 'warn',          // Warn about unused vars
    'react/jsx-no-undef': 'warn',      // Warn about undefined components
    'react/no-unescaped-entities': 'warn', // Warn about unescaped entities
    'no-undef': 'error'                // Error on undefined variables that could cause runtime errors
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
    },
    // Rules for jsx files
    {
      files: ["**/*.{jsx,tsx}", "**/*.js"],
      parser: "@babel/eslint-parser",
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
          plugins: ["@babel/plugin-syntax-jsx"]
        }
      }
    }
  ]
} 