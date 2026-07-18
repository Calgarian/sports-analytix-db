-- 1. Ligleri ekleyelim
INSERT INTO Leagues (league_name, sport_type, country) VALUES 
('Champions League', 'Football', 'International'),
('NBA', 'Basketball', 'USA'),
('Süper Lig', 'Football', 'Turkey');

-- 2. Takımları ekleyelim 
-- (league_id değerleri sırasıyla 1, 2, 3 olacak)
INSERT INTO Teams (league_id, team_name, stadium_or_arena, established_year) VALUES 
(1, 'Real Madrid', 'Santiago Bernabeu', 1902),
(1, 'Galatasaray', 'RAMS Park', 1905),
(2, 'LA Lakers', 'Crypto.com Arena', 1947),
(3, 'Fenerbahçe', 'Şükrü Saracoğlu', 1907);

-- 3. Maç Fikstürü Ekleme (Şampiyonlar Ligi ve NBA maçları)
-- Hatırlatma: Real Madrid (1), Galatasaray (2), LA Lakers (3) ID'lerine sahipti.
INSERT INTO Matches (league_id, home_team_id, away_team_id, match_date, match_status) VALUES 
(1, 2, 1, '2026-10-24 21:45:00', 'Scheduled'), -- Galatasaray vs Real Madrid (Şampiyonlar Ligi)
(2, 3, 3, '2026-11-15 04:30:00', 'Scheduled'); -- LA Lakers kendi içinde simüle (veya ileride eklenecek bir NBA takımı)

-- 4. Bu Maçlara Ait İlk Bahis Oranlarını Ekleme
-- Hatırlatma: İlk eklediğimiz maçın ID'si otomatik olarak 1 olacak.
INSERT INTO Betting_Odds (match_id, home_win_odd, draw_odd, away_win_odd) VALUES 
(1, 3.40, 3.80, 1.85); -- Galatasaray galibiyetine 3.40, beraberliğe 3.80, Real Madrid'e 1.85 oran

SELECT 
    m.match_date AS "Maç Tarihi",
    ht.team_name AS "Ev Sahibi",
    at.team_name AS "Deplasman",
    o.home_win_odd AS "MS 1 Oranı",
    o.draw_odd AS "MS X Oranı",
    o.away_win_odd AS "MS 2 Oranı",
    m.match_status AS "Durum"
FROM Matches m
INNER JOIN Teams ht ON m.home_team_id = ht.team_id
INNER JOIN Teams at ON m.away_team_id = at.team_id
LEFT JOIN Betting_Odds o ON m.match_id = o.match_id;