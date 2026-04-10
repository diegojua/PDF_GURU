export const normalizeLocalhostForAndroid = (baseUrl: string, platformOS: string): string => {
  if (platformOS === 'android' && baseUrl.includes('localhost')) {
    return baseUrl.replace('localhost', '10.0.2.2');
  }

  return baseUrl;
};
