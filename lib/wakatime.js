const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

export async function fetchWakaTimeLast7Days() {
  if (!WAKATIME_API_KEY) {
    throw new Error('Missing WAKATIME_API_KEY');
  }

  const response = await fetch(
    'https://wakatime.com/api/v1/users/current/stats/last_7_days',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString('base64')}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch WakaTime data');
  }

  const json = await response.json();

  return {
    total: json.data.human_readable_total,
    languages: json.data.languages.slice(0, 3),
  };
}
