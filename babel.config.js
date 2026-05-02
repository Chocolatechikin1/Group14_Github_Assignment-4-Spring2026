module.exports = function (api) {
  // Cache the Babel config because this Expo app does not change presets at runtime.
  api.cache(true);
  return {
    // Expo's preset includes React Native Web transforms and TypeScript support.
    presets: ['babel-preset-expo'],
  };
};
