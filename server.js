import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

const DATA_FILE = join(__dirname, 'data', 'tokens.json');

// Ensure data directory exists
if (!fs.existsSync(join(__dirname, 'data'))) {
  fs.mkdirSync(join(__dirname, 'data'));
}

// Initialize empty tokens file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Get all tokens
app.get('/api/tokens', (req, res) => {
  try {
    const tokens = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Error reading tokens data' });
  }
});

// Add new token
app.post('/api/tokens', (req, res) => {
  try {
    const tokens = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const newToken = {
      ...req.body,
      id: tokens.length + 1,
      timestamp: new Date().toISOString()
    };
    
    tokens.push(newToken);
    fs.writeFileSync(DATA_FILE, JSON.stringify(tokens, null, 2));
    
    res.status(201).json(newToken);
  } catch (error) {
    res.status(500).json({ error: 'Error saving token data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 