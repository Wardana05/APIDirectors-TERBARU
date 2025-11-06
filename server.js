require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./database.js');
const authenticateToken = require('./middleware/authMiddleware'); // Pastikan file ini ada

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; // Mengambil secret key dari .env

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint status (GET /status)
app.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date()
    });
});

// ================= AUTH ROUTES (REGISTRASI & LOGIN) =================
// Catatan: Route ini harus diletakkan sebelum route lain yang dilindungi dan sebelum handler 404.

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing:", err);
            return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
        }

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        const params = [username.toLowerCase(), hashedPassword];

        db.run(sql, params, function(err) {
            // Error code 19 sering berarti UNIQUE constraint violation (username sudah ada)
            if (err && err.errno === 19) {
                return res.status(409).json({ error: 'Username sudah terdaftar. Gunakan username lain.' });
            }
            if (err) {
                console.error('Gagal memasukkan user:', err.message);
                return res.status(500).json({ error: 'Gagal menyimpan data user' });
            }

            res.status(201).json({ message: 'User berhasil didaftarkan', userId: this.lastID });
        });
    });
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Kredensial tidak valid' });
            }

            const payload = { user: { id: user.id, username: user.username } };

            // Pastikan JWT_SECRET diisi di file .env Anda!
            jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({ error: 'Gagal membuat token' });
                }
                res.json({ message: 'Login berhasil', token: token });
            });
        });
    });
});

// ================= MOVIES (PUBLIK dan PROTECTED) =================

// GET /movies (PUBLIK - Tidak perlu token)
app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movie ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json(rows);
    });
});

// POST /movies (PROTECTED - Memerlukan token)
// Kita menggunakan logika dari POST /movies di baris 33 yang sudah Anda buat
app.post('/movies', authenticateToken, (req, res) => {
    const { title, director, year } = req.body;
    
    // Log untuk debugging user yang membuat request
    console.log(`POST /movies diakses oleh user: ${req.user.username}`);

    if (!title || !director || !year) {
        return res.status(400).json({ error: "title, director, year are required" });
    }
    const sql = 'INSERT INTO movie (title, director, year) VALUES (?,?,?)';
    db.run(sql, [title, director, year], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, director, year, message: 'Film berhasil ditambahkan' });
    });
});

// ================= DIRECTORS (PUBLIK dan PROTECTED) =================
// Kita asumsikan directors juga perlu dilindungi (kecuali GET)

app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/directors/:id', (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(row || { message: "Director not found" });
    });
});

// POST /directors (PROTECTED - Memerlukan token)
app.post('/directors', authenticateToken, (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    const sql = "INSERT INTO directors (name, birthYear) VALUES (?, ?)";
    db.run(sql, [name, birthYear], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, birthYear });
    });
});

// PUT /directors/:id (PROTECTED - Memerlukan token)
app.put('/directors/:id', authenticateToken, (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    const sql = "UPDATE directors SET name = ?, birthYear = ? WHERE id = ?";
    db.run(sql, [name, birthYear, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updatedID: req.params.id, name, birthYear });
    });
});

// DELETE /directors/:id (PROTECTED - Memerlukan token)
app.delete('/directors/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM directors WHERE id = ?";
    db.run(sql, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deletedID: req.params.id });
    });
});

// ================== ERROR HANDLER / 404 ==================
// Handler 404 HARUS diletakkan sebagai yang terakhir setelah SEMUA route Anda.
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server Running on http://localhost:${port}`);
});