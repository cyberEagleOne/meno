const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build imports a .wasm asset; register it so Metro bundles it.
config.resolver.assetExts.push("wasm");
// The ILT3 database uses .sqlite; Metro only registers .db by default.
config.resolver.assetExts.push("sqlite");

module.exports = config;
