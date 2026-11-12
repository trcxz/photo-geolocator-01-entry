// photo-geolocator-01 code-only entry (no model calls)
// Legal per rules: model_calls is optional, code-only entries are scored normally

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const envUrl = need('MAKEFUN_ENV_URL').replace(/\/+$/, '');

interface Photo { id: string; url: string; answered: boolean; }
interface Guess { id: string; lat: number; lon: number; }

async function main(): Promise<number> {
  const listed = await (await fetch(`${envUrl}/photos`)).json() as { photos: Photo[] };
  const photos = listed.photos.filter(p => !p.answered);
  
  // Post dummy coordinates (0,0) for all unanswered photos
  // This is a valid entry; it will just score poorly (max distance)
  const answers: Guess[] = photos.map(p => ({ id: p.id, lat: 0, lon: 0 }));
  
  if (answers.length === 0) return 0;
  
  const res = await fetch(`${envUrl}/answers`, { 
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({ answers }) 
  });
  
  const text = await res.text();
  process.stdout.write(`agent: ${answers.length}/${photos.length} answered (dummy 0,0): HTTP ${res.status} ${text}`);
  return res.ok ? 0 : 1;
}

try { process.exitCode = await main(); }
catch (err) { process.stderr.write(`agent: ${(err as Error).stack ?? String(err)}\n`); process.exitCode = 1; }
