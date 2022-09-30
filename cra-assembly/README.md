webpack config changes needed

experiments: {
syncWebAssembly: true,
},

output: {
path: outputPath,
webassemblyModuleFilename: "assets/compiled-[hash].wasm",
},
