/**
 * Application URLs.
 * Override with environment variables when needed (e.g. staging vs prod).
 */
export const urls = {
  app: process.env.BASE_URL ?? 'https://app.tesorabcp.com',
  login:
    process.env.LOGIN_URL ??
    'https://tesorabcp.b2clogin.com/tesorabcp.onmicrosoft.com/oauth2/v2.0/authorize' +
      '?p=B2C_1_tesora_app_login' +
      '&client_id=7347468d-6a33-4dfd-91c8-3acb7fde5ae0' +
      '&nonce=defaultNonce' +
      '&redirect_uri=https%3A%2F%2Fapp.tesorabcp.com%2Floading' +
      '&scope=openid' +
      '&response_type=id_token' +
      '&prompt=login',
} as const;
