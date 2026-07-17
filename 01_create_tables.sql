-- 1. Ligler Tablosu (NBA, Şampiyonlar Ligi vb.)
CREATE TABLE Leagues (
    league_id SERIAL PRIMARY KEY,
    league_name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL, -- 'Football', 'Basketball' vb.
    country VARCHAR(50) DEFAULT 'International',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Takımlar Tablosu (Real Madrid, LA Lakers vb.)
CREATE TABLE Teams (
    team_id SERIAL PRIMARY KEY,
    league_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    stadium_or_arena VARCHAR(100),
    established_year INT,
    FOREIGN KEY (league_id) REFERENCES Leagues(league_id) ON DELETE RESTRICT
);