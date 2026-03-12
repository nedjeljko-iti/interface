'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET || 'interface-secret-key';
const JWT_EXPIRES = '8h';

/**
 * Potpisuje JWT token s datim payloadom.
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * Provjera JWT tokena iz Next.js API route requesta.
 * Vraća decoded payload ili null ako token nije valjan.
 */
function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyAuth };
