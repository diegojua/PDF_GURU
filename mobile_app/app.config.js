import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      // Production backend URL. Override in .env before building.
      // Example: API_BASE_URL=https://api.pdfguru.com
      API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? config.extra?.eas?.projectId ?? '',
      },
    },
  };
};
