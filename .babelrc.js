module.exports = {
  presets: [
    ["@babel/preset-env", {
      "targets": {
        "node": "current",
        "browsers": ["last 2 versions", "not dead", "not ie 11"]
      },
    }],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ],
  plugins: [
    "@babel/plugin-syntax-jsx",
    ["@babel/plugin-transform-runtime", {
      "regenerator": true
    }]
  ]
}; 