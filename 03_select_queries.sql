-- Takımlar tablosundaki her şeyi ekrana getir
SELECT * FROM Teams;

-- Sadece 1905'ten sonra kurulmuş takımları getir
SELECT team_name, established_year 
FROM Teams 
WHERE established_year > 1905;

-- Takımları ve bağlı oldukları lig isimlerini birleştirerek getir
SELECT 
    t.team_name, 
    l.league_name, 
    l.sport_type
FROM Teams t
INNER JOIN Leagues l ON t.league_id = l.league_id;

-- MÜLAKAT SORUSU: Her maçın sadece EN GÜNCEL bahis oranını getiren analitik sorgu (Soft Delete Korumalı)
SELECT 
    m.match_id,
    le.league_name,
    t1.team_name AS home_team,
    t2.team_name AS away_team,
    m.match_date,
    bo.home_win_odd,
    bo.draw_odd,
    bo.away_win_odd,
    bo.recorded_at AS odds_last_updated
FROM Matches m
JOIN Leagues le ON m.league_id = le.league_id
JOIN Teams t1 ON m.home_team_id = t1.team_id
JOIN Teams t2 ON m.away_team_id = t2.team_id
LEFT JOIN (
    SELECT DISTINCT ON (match_id) 
        match_id, home_win_odd, draw_odd, away_win_odd, recorded_at
    FROM Betting_Odds
    ORDER BY match_id, recorded_at DESC
) bo ON m.match_id = bo.match_id
-- DOĞRU YER: Filtre alt sorgunun içinde değil, dışarıda tüm tablonun filtresi olarak yer almalı!
WHERE m.is_deleted = FALSE
ORDER BY m.match_date DESC;