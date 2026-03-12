import { getServerList } from '@/lib/serverConfig';

export async function GET() {
  try {
    return Response.json(getServerList());
  } catch (err) {
    return Response.json({ error: 'Greška pri učitavanju liste servera.' }, { status: 500 });
  }
}
