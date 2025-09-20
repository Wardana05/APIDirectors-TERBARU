require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = process.env.DB_SOURCE;

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Tabel movie
        db.run(`
            CREATE TABLE movie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                director TEXT NOT NULL,
                year INTEGER NOT NULL
            )`, (err) => {
            if (!err) {
                const insert = 'INSERT INTO movie (title, director, year) VALUES (?,?,?)';
                db.run(insert, ["The Matrix", "Lana Wachowski", 1999]);
                db.run(insert, ["The Shawshank Redemption", "Frank Darabont", 1994]);
                db.run(insert, ["Inception", "Christopher Nolan", 2010]);
                db.run(insert, ["Forrest Gump", "Robert Zemeckis", 1994]);
            }
        });

        // Tabel directors
        db.run(`
            CREATE TABLE directors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                birthYear INTEGER NOT NULL
            )`, (err) => {
            if (!err) {
                const insert = 'INSERT INTO directors (name, birthYear) VALUES (?, ?)';
                db.run(insert, ["Christopher Nolan", 1970]);
                db.run(insert, ["Quentin Tarantino", 1963]);
                db.run(insert, ["Hayao Miyazaki", 1941]);
            }
        });
    }
});

module.exports = db;