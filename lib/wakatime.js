const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

export async function fetchWakaTimeLast7Days() {
  if (!WAKATIME_API_KEY) {
    throw new Error('Missing WAKATIME_API_KEY');
  }

  const auth = Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64');

  const response = await fetch(
    'https://wakatime.com/api/v1/users/current/stats/last_7_days',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'User-Agent': 'profile-stats',
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WakaTime API error: ${text}`);
  }

  const json = await response.json();

  return {
    total: json.data.human_readable_total,
    languages: json.data.languages.slice(0, 3),
  };
}
