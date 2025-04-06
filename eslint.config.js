/**
 * ESLint Configuration for Ride With Vic
 * 
 * This configuration supports ES modules and JSX syntax
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: ['node_modules/**', '.git/**', '.husky/**', 'out/**', '.next/**', '.vercel/**']
  },
  // Global settings for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'writable',
        process: 'readonly',
        navigator: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      // Import path rules
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
      // Basic rules
      "no-duplicate-imports": ["error", { "includeExports": true }],
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
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
]; 