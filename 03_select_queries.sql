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