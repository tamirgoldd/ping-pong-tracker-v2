import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve('./data.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Read data
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      res.status(200).json(data);
    } else {
      res.status(200).json({ players: [], matches: [] });
    }
  } else if (req.method === 'POST') {
    // Write data
    const data = req.body;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
