/**
 * Test Validators README
 * 
 * This file provides documentation about the test validators used in the project.
 */

/**
 * Directory Structure
 * 
 * The test directory structure mirrors the application structure:
 * 
 * test/
 * ├── components/    # Component tests
 * ├── lib/           # Library tests
 * ├── pages/         # Page tests
 * ├── validators/    # Validation utilities
 * └── utils/         # Test utilities and validation scripts
 */

/**
 * Validator Functions
 * 
 * The validators directory contains several tools for validating the codebase:
 * 
 * - detect-mocks.js: Scans the codebase for mock implementations or test stubs
 * - detect-duplicates.js: Identifies duplicate files (by name and content)
 * - check-requirements.js: Validates the project against requirements
 */

/**
 * Running Tests
 * 
 * Tests can be run with:
 * 
 * npm test
 */

module.exports = {
  // Exporting metadata about test validators
  validators: {
    names: [
      'detect-mocks',
      'detect-duplicates',
      'check-requirements'
    ],
    directory: 'test/validators'
  }
}; 