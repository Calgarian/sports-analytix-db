require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware Ayarları
app.use(cors());
app.use(express.json());

// PostgreSQL Bağlantı Ayarları (Çevre Değişkenlerinden Okunur)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sports_analytix_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// 1. Test Rotası
app.get('/', (req, res) => {
  res.send('Sports Analytix API çalışıyor!');
});

// 2. Tüm Maçları Getiren Rota (GET)
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
      INNER JOIN teams t1 ON m.home_team_id = t1.team_id
      INNER JOIN teams t2 ON m.away_team_id = t2.team_id
      LEFT JOIN betting_odds bo ON m.match_id = bo.match_id
      ORDER BY m.match_date DESC;
    `;
    
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error('Veritabanı sorgu hatası:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Yeni Maç Ekleme Rotası (POST - Transaction'lı)
app.post('/api/matches', async (req, res) => {
  const { home_team_id, away_team_id, match_date, home_win_odd, draw_odd, away_win_odd } = req.body;

  // Validasyon: Aynı takım kendiyle oynayamaz
  if (parseInt(home_team_id) === parseInt(away_team_id)) {
    return res.status(400).json({ error: 'Ev sahibi ve deplasman takımı aynı olamaz.' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN'); // Transaction Başlat

    // 1. Maç Ekleme
    const matchInsertQuery = `
      INSERT INTO matches (home_team_id, away_team_id, match_date)
      VALUES ($1, $2, $3)
      RETURNING match_id;
    `;
    const matchResult = await client.query(matchInsertQuery, [home_team_id, away_team_id, match_date]);
    const newMatchId = matchResult.rows[0].match_id;

    // 2. Oran Ekleme
    const oddsInsertQuery = `
      INSERT INTO betting_odds (match_id, home_win_odd, draw_odd, away_win_odd)
      VALUES ($1, $2, $3, $4);
    `;
    await client.query(oddsInsertQuery, [newMatchId, home_win_odd, draw_odd, away_win_odd]);

    await client.query('COMMIT'); // İşlemleri Onayla
    res.status(201).json({ message: 'Maç başarıyla eklendi!', match_id: newMatchId });

  } catch (err) {
    if (client) await client.query('ROLLBACK'); // Hata durumunda geri al
    console.error('Maç ekleme hatası:', err.message);

    // Foreign Key Hata Yakalama (23503)
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Girilen takım ID veritabanında bulunamadı.' });
    }

    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release(); // Bağlantıyı güvenli şekilde havuza bırak
  }
});

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde ayağa kalktı.`);
});