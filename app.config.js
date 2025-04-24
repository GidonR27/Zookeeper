import { config } from './app.json';

export default ({ config: baseConfig }) => {
  // Use the base config from app.json
  const finalConfig = { ...baseConfig };

  // For web exports, specify the web platform
  if (process.env.EXPO_TARGET === 'web') {
    finalConfig.platforms = ['web'];
  }

  return finalConfig;
}; 