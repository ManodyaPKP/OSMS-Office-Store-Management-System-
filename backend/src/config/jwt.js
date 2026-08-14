import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_SECRET = 'osms_dev_secret_key_2026_replace_with_long_random_secret_in_production';
const configuredSecret = process.env.JWT_SECRET || DEFAULT_SECRET;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('JWT_SECRET is missing or too short. Falling back to a development secret. Set a strong random secret in backend/.env before production deployment.');
}

export const getJwtConfig = () => ({
  secret: configuredSecret,
  expiresIn: process.env.JWT_EXPIRE || '8h',
  issuer: process.env.JWT_ISSUER || 'osms-api',
  audience: process.env.JWT_AUDIENCE || 'osms-client',
  algorithm: 'HS256'
});

export const signAccessToken = (payload) => {
  const config = getJwtConfig();

  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn,
    issuer: config.issuer,
    audience: config.audience,
    algorithm: config.algorithm
  });
};

export const verifyAccessToken = (token) => {
  const config = getJwtConfig();

  return jwt.verify(token, config.secret, {
    algorithms: [config.algorithm],
    issuer: config.issuer,
    audience: config.audience
  });
};
