export const ENVIRONMENTS: any = {
  development: {
    apiUrl: `https://api-staging.nexttier.com/v1`,
    production: false
  },
  production: {
    apiUrl: `https://api.nexttier.com/v1`,
    production: true,
    silent: false
  },
  staging: {
    apiUrl: `https://api-staging.nexttier.com/v1`,
    production: false
  }
};
