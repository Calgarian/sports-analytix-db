const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware Ayarları
app.use(cors());
app.use(express.json());

// PostgreSQL Bağlantı Ayarları
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sports_analytix_db',
  password: 'ufuk1234',
  port: 5432,
});

// 1. Test Rotası
app.get('/', (req, res) => {
  res.send('Sports Analytix API çalışıyor!');
});

// 2. Tüm Maçları ve Bahis Oranlarını Getiren Rota
app.get('/api/matches', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        m.match_id,
        m.match_date,
        t1.team_name AS home_team,
        t2.team_name AS away_team,
        bo.home_win_odd,
        bo.draw_odd,
        bo.away_win_odd
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.team_id
      JOIN teams t2 ON m.away_team_id = t2.team_id
      LEFT JOIN betting_odds bo ON m.match_id = bo.match_id
      ORDER BY m.match_date DESC;
    `;
    
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error('Veritabanı sorgu hatası:', err.message);
    res.status(500).json({ error: 'Sunucu hatası, veriler alınamadı.' });
  }
});

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde ayağa kalktı.`);
});