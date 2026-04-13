// Simple in-memory visitor counter (resets on server restart)
// For production, replace with Vercel KV or similar
let total = 83241;
let todayCount = 512;
let lastReset = new Date().toISOString().slice(0, 10);

export async function POST() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastReset) {
    todayCount = 0;
    lastReset = today;
  }
  total++;
  todayCount++;
  return Response.json({ total, today: todayCount });
}

export async function GET() {
  return Response.json({ total, today: todayCount });
}
