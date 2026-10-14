export default function handler(req: any, res: any) {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', hasApiKey });
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ status: 'ok', hasApiKey }));
}
