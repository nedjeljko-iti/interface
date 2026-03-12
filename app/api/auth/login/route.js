import { signToken } from '@/lib/auth-server';
import { callLoginProcedure } from '@/lib/authService';
import { getConnConfig } from '@/lib/serverConfig';

export async function POST(request) {
  const body = await request.json();
  const { login, lozinka, serverId } = body || {};

  if (!login || !lozinka || !serverId) {
    return Response.json({ error: 'Login, lozinka i server su obavezni.' }, { status: 400 });
  }

  let connConfig;
  try {
    connConfig = getConnConfig(serverId);
  } catch (err) {
    return Response.json({ error: 'Odabrani server nije valjan.' }, { status: 400 });
  }

  let result;
  try {
    result = await callLoginProcedure(login.trim(), lozinka, connConfig);
  } catch (err) {
    console.error('Login Oracle greška:', err.message);
    return Response.json({ error: `Oracle greška: ${err.message}` }, { status: 503 });
  }

  if (result.returnCode !== 0) {
    console.log(`Login neuspješan za "${login}" (${serverId}): returnCode=${result.returnCode}`);
    return Response.json({ error: 'Pogrešno korisničko ime ili lozinka.' }, { status: 401 });
  }

  const payload = {
    login:   login.trim(),
    serverId,
    sifra:   result.sifra,
    ime:     result.ime,
    prezime: result.prezime,
    pod:     result.pod,
    org:     result.org,
    grusr:   result.grusr,
  };

  const token = signToken(payload);

  return Response.json({
    token,
    login:   payload.login,
    ime:     payload.ime,
    prezime: payload.prezime,
    grusr:   payload.grusr,
  });
}
