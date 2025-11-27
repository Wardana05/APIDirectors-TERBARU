// database.js (Versi PostgreSQL)

// Hapus require('dotenv').config() karena sudah ada di server.js
const { Pool } = require('pg');

// Menggunakan DATABASE_URL dari .env (untuk lokal) atau dari Vercel (untuk produksi)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    // throw Error ini penting agar server tidak berjalan tanpa koneksi DB
    throw new Error("DATABASE_URL tidak ditemukan di environment variables. Pastikan sudah diatur di file .env atau di Vercel.");
}

// Buat connection pool (penting untuk menangani banyak request dari server web)
const pool = new Pool({
    connectionString: connectionString,
    // Diperlukan untuk layanan cloud seperti Neon/Supabase
    ssl: {
        rejectUnauthorized: false 
    }
});

/**
 * Fungsi untuk menginisialisasi database: 
 * Membuat tabel jika belum ada dan mengisi data awal (seeding).
 */
async function initializeDatabase() {
    console.log("Menghubungkan dan menginisialisasi PostgreSQL...");
    try {
        // --- 1. Buat/Verifikasi Tabel USERS ---
        // PRIMARY KEY AUTOINCREMENT SQLite diganti menjadi SERIAL PRIMARY KEY di PostgreSQL
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'
            );
        `);
        console.log('Tabel users berhasil diverifikasi/dibuat.');

        // --- 2. Buat/Verifikasi Tabel MOVIE ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS movie (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                director TEXT NOT NULL,
                year INTEGER NOT NULL
            );
        `);
        console.log('Tabel movie berhasil diverifikasi/dibuat.');
        
        // Cek apakah tabel movie kosong, jika ya, isi data awal
        const movieCheck = await pool.query('SELECT COUNT(*) FROM movie');
        if (parseInt(movieCheck.rows[0].count) === 0) {
            console.log('Mengisi data awal untuk tabel movie...');
            const insert = 'INSERT INTO movie (title, director, year) VALUES ($1, $2, $3)';
            await pool.query(insert, ["The Matrix", "Lana Wachowski", 1999]);
            await pool.query(insert, ["The Shawshank Redemption", "Frank Darabont", 1994]);
            await pool.query(insert, ["Inception", "Christopher Nolan", 2010]);
            await pool.query(insert, ["Forrest Gump", "Robert Zemeckis", 1994]);
            console.log('4 film berhasil ditambahkan.');
        }


        // --- 3. Buat/Verifikasi Tabel DIRECTORS ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS directors (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                birthYear INTEGER NOT NULL
            );
        `);
        console.log('Tabel directors berhasil diverifikasi/dibuat.');

        // Cek apakah tabel directors kosong, jika ya, isi data awal
        const directorCheck = await pool.query('SELECT COUNT(*) FROM directors');
        if (parseInt(directorCheck.rows[0].count) === 0) {
            console.log('Mengisi data awal untuk tabel directors...');
            const insert = 'INSERT INTO directors (name, birthYear) VALUES ($1, $2)';
            await pool.query(insert, ["Christopher Nolan", 1970]);
            await pool.query(insert, ["Quentin Tarantino", 1963]);
            await pool.query(insert, ["Hayao Miyazaki", 1941]);
            console.log('3 directors berhasil ditambahkan.');
        }


    } catch (error) {
        console.error("FATAL: Gagal menginisialisasi database:", error.message);
        throw error; // Lempar error agar server tidak berjalan
    }
}

// Ekspor pool untuk digunakan dalam operasi query di server.js
// Ekspor initializeDatabase untuk dipanggil saat server start
module.exports = {
    pool,
    initializeDatabase
};