import { parseCSV, buildClobParams } from '@/lib/csvParser';
import { callImportProcedure } from '@/lib/oracleService';
import { getConnConfig } from '@/lib/serverConfig';
import { verifyAuth } from '@/lib/auth-server';

const RETURN_MESSAGES = {
   0: 'Uspješno uvezeno',
   1: 'Godina je zatvorena',
   2: 'Nepostojeći konto',
   3: 'Već importirano',
  '-1': 'Nepoznata greška',
};

export async function POST(request) {
  const user = verifyAuth(request);
  if (!user) {
    return Response.json({ error: 'Niste prijavljeni.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) {
    return Response.json({ error: 'Niste uploadali fajl.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let rows;
  try {
    rows = parseCSV(buffer);
  } catch (err) {
    return Response.json({ error: `Greška pri parsiranju CSV-a: ${err.message}` }, { status: 422 });
  }

  const { clobs, rowCount } = buildClobParams(rows);

  let result;
  try {
    const connConfig = getConnConfig(user.serverId);
    result = await callImportProcedure(clobs, user.login, connConfig);
  } catch (err) {
    return Response.json({ error: `Greška pri pozivu Oracle procedure: ${err.message}` }, { status: 500 });
  }

  const { returnCode, info } = result;
  const success = returnCode === 0;
  const message = RETURN_MESSAGES[returnCode] ?? `Neočekivani povratni kod: ${returnCode}`;

  return Response.json({ success, returnCode, rowCount, message, info });
}
