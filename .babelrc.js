export default {
  presets: [
    ["@babel/preset-env", { 
      "targets": { 
        "node": "current",
        "browsers": ["last 2 versions", "not dead", "not ie 11"]
      },
      "modules": false
    }],
    ["@babel/preset-react", { 
      "runtime": "automatic",
      "importSource": "react"
    }]
  ],
  plugins: [
    "@babel/plugin-syntax-jsx",
    ["@babel/plugin-transform-runtime", {
      "regenerator": true,
      "useESModules": true
    }]
  ]
}; 