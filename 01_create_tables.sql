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

-- 3. Maçlar Tablosu
CREATE TABLE Matches (
    match_id SERIAL PRIMARY KEY,
    league_id INT NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    match_date TIMESTAMP NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE, -- Dün eklediğimiz Soft Delete kolonu
    FOREIGN KEY (league_id) REFERENCES Leagues(league_id) ON DELETE RESTRICT,
    FOREIGN KEY (home_team_id) REFERENCES Teams(team_id) ON DELETE RESTRICT,
    FOREIGN KEY (away_team_id) REFERENCES Teams(team_id) ON DELETE RESTRICT
);

-- 4. Bahis Oranları Tablosu
CREATE TABLE Betting_Odds (
    odds_id SERIAL PRIMARY KEY,
    match_id INT NOT NULL,
    home_win_odd NUMERIC(5,2) NOT NULL,
    draw_odd NUMERIC(5,2), -- Basketbol için NULL olabilir
    away_win_odd NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE
);

-- 5. Performans İndeksleri
CREATE INDEX idx_matches_match_date ON Matches(match_date);
CREATE INDEX idx_matches_league_id ON Matches(league_id);