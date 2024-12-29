import { redis } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [players, matches] = await redis.mget(['players', 'matches']);
      res.status(200).json({
        players: players || [],
        matches: matches || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else if (req.method === 'POST') {
    try {
      const { players, matches } = req.body;
      await redis.mset([
        ['players', JSON.stringify(players)],
        ['matches', JSON.stringify(matches)]
      ]);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  }
}
