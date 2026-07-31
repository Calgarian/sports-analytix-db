require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware Ayarları
app.use(cors());
app.use(express.json());

// PostgreSQL Bağlantı Pool'u
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sports_analytix_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Helper: Oran Doğrulama Fonksiyonu
const isValidOdd = (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0;

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
    res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
  }
});

// 3. Yeni Maç Ekleme Rotası (POST - Transaction'lı)
app.post('/api/matches', async (req, res) => {
  const { home_team_id, away_team_id, match_date, home_win_odd, draw_odd, away_win_odd } = req.body;

  // Validasyon 1: Takımlar aynı olamaz
  if (parseInt(home_team_id) === parseInt(away_team_id)) {
    return res.status(400).json({ error: 'Ev sahibi ve deplasman takımı aynı olamaz.' });
  }

  // Validasyon 2: Oranlar sayısal ve 0'dan büyük olmalı
  if (!isValidOdd(home_win_odd) || !isValidOdd(draw_odd) || !isValidOdd(away_win_odd)) {
    return res.status(400).json({ error: 'Geçerli ve 0’dan büyük oran değerleri giriniz.' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const matchInsertQuery = `
      INSERT INTO matches (home_team_id, away_team_id, match_date)
      VALUES ($1, $2, $3)
      RETURNING match_id;
    `;
    const matchResult = await client.query(matchInsertQuery, [home_team_id, away_team_id, match_date]);
    const newMatchId = matchResult.rows[0].match_id;

    const oddsInsertQuery = `
      INSERT INTO betting_odds (match_id, home_win_odd, draw_odd, away_win_odd)
      VALUES ($1, $2, $3, $4);
    `;
    await client.query(oddsInsertQuery, [newMatchId, home_win_odd, draw_odd, away_win_odd]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Maç başarıyla eklendi!', match_id: newMatchId });

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Maç ekleme hatası:', err.message);

    if (err.code === '23503') {
      return res.status(400).json({ error: 'Girilen takım ID veritabanında bulunamadı.' });
    }

    res.status(500).json({ error: 'Veritabanı kaydı sırasında hata oluştu.' });
  } finally {
    if (client) client.release();
  }
});

// 4. Maç ve Oran Silme Rotası (DELETE)
app.delete('/api/matches/:id', async (req, res) => {
  const matchId = parseInt(req.params.id);
  if (isNaN(matchId)) {
    return res.status(400).json({ error: 'Geçersiz Maç ID parametresi.' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // betting_odds tablosundan sil
    await client.query('DELETE FROM betting_odds WHERE match_id = $1', [matchId]);
    // matches tablosundan sil
    const result = await client.query('DELETE FROM matches WHERE match_id = $1 RETURNING *', [matchId]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Silinmek istenen maç bulunamadı.' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Maç ve bağlı oranlar başarıyla silindi.', match_id: matchId });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Maç silme hatası:', err.message);
    res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu.' });
  } finally {
    if (client) client.release();
  }
});

// 5. Oran Güncelleme Rotası (PUT)
app.put('/api/matches/:id/odds', async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { home_win_odd, draw_odd, away_win_odd } = req.body;

  if (isNaN(matchId)) {
    return res.status(400).json({ error: 'Geçersiz Maç ID parametresi.' });
  }

  if (!isValidOdd(home_win_odd) || !isValidOdd(draw_odd) || !isValidOdd(away_win_odd)) {
    return res.status(400).json({ error: 'Geçerli ve 0’dan büyük oran değerleri giriniz.' });
  }

  try {
    const updateQuery = `
      UPDATE betting_odds 
      SET home_win_odd = $1, draw_odd = $2, away_win_odd = $3 
      WHERE match_id = $4 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [home_win_odd, draw_odd, away_win_odd, matchId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Güncellenecek maç veya oran kaydı bulunamadı.' });
    }

    res.json({ message: 'Oranlar başarıyla güncellendi.', odds: result.rows[0] });
  } catch (err) {
    console.error('Oran güncelleme hatası:', err.message);
    res.status(500).json({ error: 'Güncelleme sırasında bir hata oluştu.' });
  }
});

// Sunucuyu En Son Başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde ayağa kalktı.`);
});