import test from 'node:test';
import assert from 'node:assert/strict';

const jwtModule = await import('../src/config/jwt.js');

test('JWT config enforces a strong secret and secure claims', async () => {
  const { getJwtConfig, signAccessToken, verifyAccessToken } = jwtModule;
  const config = getJwtConfig();

  assert.ok(config.secret.length >= 32, 'JWT secret should be long enough');
  assert.equal(config.issuer, 'osms-api');
  assert.equal(config.audience, 'osms-client');

  const token = signAccessToken({ id: 1, username: 'admin', role: 'admin' });
  const decoded = verifyAccessToken(token);

  assert.equal(decoded.id, 1);
  assert.equal(decoded.role, 'admin');
  assert.equal(decoded.iss, 'osms-api');
  assert.equal(decoded.aud, 'osms-client');
});
