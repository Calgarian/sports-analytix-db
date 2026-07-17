# Sports Statistics & Betting Database Project

A PostgreSQL-based relational database management system designed to model, store, and query sports events, leagues, teams, and dynamic betting odds. This project demonstrates database normalization, relational constraints, and advanced data analysis via multi-table joins.

## 📊 Database Schema Architecture

The database consists of 4 highly normalized, interconnected tables:

1. **`Leagues`**: Stores core league metadata across different sports (e.g., NBA, Champions League).
2. **`Teams`**: Represents sports clubs or franchises, linked directly to their respective leagues.
3. **`Matches`**: Tracks fixtures, match dates, live/scheduled statuses, and final scores. It uses dual foreign keys pointing to the same `Teams` table to distinguish between Home and Away sides.
4. **`Betting_Odds`**: Captures historical and real-time odds fluctuations. Tied to the `Matches` table with a cascading delete constraint.

---

## 🛠️ Tech Stack & Key SQL Concepts

- **Database Engine:** PostgreSQL 18
- **DDL (Data Definition Language):** Structural table design using `SERIAL PRIMARY KEY`, `FOREIGN KEY` constraints, and defensive `IF NOT EXISTS` logic.
- **DML (Data Manipulation Language):** Safe mock data insertion mapping out real-world relational IDs.
- **Relational Integrity:** Enhanced data safety utilizing `ON DELETE RESTRICT` for reference data and `ON DELETE CASCADE` for transactional records.
- **Advanced Querying:** Complex relational workflows featuring Multi-Table `INNER JOIN` operations and selective `LEFT JOIN` handling for optional data nodes.

---

## 🚀 How to Run the Scripts

Execute the scripts inside your PostgreSQL environment (e.g., pgAdmin 4 or `psql`) in the following chronological order:

1. **`01_create_tables.sql`**: Initializes the schema structural blueprints.
2. **`02_insert_data.sql`**: Injects test records and establishes table-to-table dependencies.
3. **`03_select_queries.sql`**: Runs data projection, filtering, and analytical reporting.