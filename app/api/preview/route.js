import { parseCSV, buildRowsJson } from '@/lib/csvParser';
import { verifyAuth } from '@/lib/auth-server';

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
    return Response.json({ error: `Greška pri parsiranju: ${err.message}` }, { status: 422 });
  }

  return Response.json({ rows: buildRowsJson(rows) });
}
