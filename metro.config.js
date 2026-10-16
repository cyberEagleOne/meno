const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build imports a .wasm asset; register it so Metro bundles it.
config.resolver.assetExts.push("wasm");

module.exports = config;
