// Sabit metin: derlemede bir kez üretilir, her istekte sunucu çalışmaz.
export const dynamic = 'force-static';

export async function GET() {
  return new Response('google.com, pub-3776725197972523, DIRECT, f08c47fec0942fa0\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
