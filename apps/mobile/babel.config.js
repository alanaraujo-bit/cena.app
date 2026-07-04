module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 ships its worklets babel plugin via react-native-worklets.
    // It MUST be listed last.
    plugins: ['react-native-worklets/plugin'],
  };
};
