require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// PENTING: Import pool dan initializeDatabase dari file database.js Anda.
// Pastikan file database.js Anda mengekspor kedua objek ini untuk PostgreSQL.
const { pool, initializeDatabase } = require('./database.js'); 
// Asumsi: middleware auth.js sudah ada
const { authenticateToken, authorizeRole } = require('./middleware/auth.js');

const app = express();
const port = process.env.PORT || 3000;
// PENTING: Pastikan JWT_SECRET ada di file .env
const JWT_SECRET = process.env.JWT_SECRET; 

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

// POST /auth/register (Refaktorisasi Async)
app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // PostgreSQL menggunakan $1, $2, ... dan RETURNING id untuk mendapatkan ID yang baru dibuat
        const sql = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id'; 
        const params = [username.toLowerCase(), hashedPassword, 'user'];

        const result = await pool.query(sql, params);
        // Ambil ID dari result.rows[0]
        const userId = result.rows[0].id;
        
        res.status(201).json({ message: 'User berhasil didaftarkan', userId: userId });

    } catch (error) {
        // Error code '23505' adalah Unique Constraint Violation di PostgreSQL
        if (error.code === '23505') { 
            return res.status(409).json({ error: 'Username sudah terdaftar. Gunakan username lain.' });
        }
        console.error('Gagal memasukkan user:', error);
        return res.status(500).json({ error: 'Gagal menyimpan data user' });
    }
});

// POST /auth/register-admin (Refaktorisasi Async)
app.post('/auth/register-admin', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password diperlukan.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id';
        const params = [username.toLowerCase(), hashedPassword, 'admin'];

        const result = await pool.query(sql, params);
        const userId = result.rows[0].id;

        res.status(201).json({ message: 'Admin berhasil dibuat', userId: userId });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Username admin sudah ada' });
        }
        console.error('Gagal memasukkan admin:', error);
        return res.status(500).json({ error: 'Gagal menyimpan data admin' });
    }
});

// POST /auth/login (Refaktorisasi Async)
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const sql = "SELECT * FROM users WHERE username = $1";
    
    try {
        const result = await pool.query(sql, [username.toLowerCase()]);
        const user = result.rows[0]; // Ambil baris pertama

        if (!user) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }

        // Payload JWT menyertakan role
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role 
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 
        res.json({ message: 'Login berhasil', token: token });
        
    } catch (error) {
        console.error("Login DB Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan server." });
    }
});

// ================= MOVIES (PUBLIK dan PROTECTED) =================

// GET /movies (Refaktorisasi Async)
app.get('/movies', async (req, res) => {
    const sql = "SELECT * FROM movie ORDER BY id ASC";
    try {
        const result = await pool.query(sql);
        res.json(result.rows); // result.rows berisi semua baris data
    } catch (error) {
        console.error("GET /movies DB Error:", error);
        return res.status(500).json({ "error": error.message });
    }
});

// POST /movies (PROTECTED) (Refaktorisasi Async)
app.post('/movies', authenticateToken, async (req, res) => {
    const { title, director, year } = req.body;
    
    console.log(`POST /movies diakses oleh user: ${req.user.username}`);

    if (!title || !director || !year) {
        return res.status(400).json({ error: "title, director, year are required" });
    }
    
    const sql = 'INSERT INTO movie (title, director, year) VALUES ($1, $2, $3) RETURNING id';
    try {
        const result = await pool.query(sql, [title, director, year]);
        const newId = result.rows[0].id;

        res.status(201).json({ id: newId, title, director, year, message: 'Film berhasil ditambahkan' });
    } catch (error) {
        console.error("POST /movies DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// Endpoint PUT /movies/:id (PROTECTED - Hanya Admin) (Refaktorisasi Async)
app.put('/movies/:id', [authenticateToken, authorizeRole('admin')], async (req, res) => {
    const { title, director, year } = req.body;
    const { id } = req.params;
    
    if (!title || !director || !year) {
        return res.status(400).json({ error: "title, director, and year are required" });
    }

    const sql = 'UPDATE movie SET title = $1, director = $2, year = $3 WHERE id = $4';
    try {
        const result = await pool.query(sql, [title, director, year, id]);

        // result.rowCount digunakan untuk memeriksa baris yang terpengaruh (updated/deleted)
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Movie not found or no changes made." });
        }
        res.json({ updatedID: id, title, director, year, message: 'Film berhasil diperbarui' });
    } catch (error) {
        console.error("PUT /movies/:id DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// Endpoint DELETE /movies/:id (PROTECTED - Hanya Admin) (Refaktorisasi Async)
app.delete('/movies/:id', [authenticateToken, authorizeRole('admin')], async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM movie WHERE id = $1";
    
    try {
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Movie not found." });
        }
        res.json({ deletedID: id, message: "Film berhasil dihapus" });
    } catch (error) {
        console.error("DELETE /movies/:id DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// ================= DIRECTORS (PUBLIK dan PROTECTED) =================

// GET /directors (Refaktorisasi Async)
app.get('/directors', async (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    try {
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (error) {
        console.error("GET /directors DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// GET /directors/:id (Refaktorisasi Async)
app.get('/directors/:id', async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM directors WHERE id = $1";
    
    try {
        const result = await pool.query(sql, [id]);
        const row = result.rows[0];

        if (!row) {
            return res.status(404).json({ message: "Director not found" });
        }
        res.json(row);
    } catch (error) {
        console.error("GET /directors/:id DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// POST /directors (PROTECTED) (Refaktorisasi Async)
app.post('/directors', authenticateToken, async (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    
    const sql = "INSERT INTO directors (name, birthYear) VALUES ($1, $2) RETURNING id";
    try {
        const result = await pool.query(sql, [name, birthYear]);
        const newId = result.rows[0].id;
        
        res.status(201).json({ id: newId, name, birthYear });
    } catch (error) {
        console.error("POST /directors DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// PUT /directors/:id (PROTECTED - Hanya Admin) (Refaktorisasi Async)
app.put('/directors/:id', [authenticateToken, authorizeRole('admin')], async (req, res) => {
    const { name, birthYear } = req.body;
    const { id } = req.params;

    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    
    const sql = "UPDATE directors SET name = $1, birthYear = $2 WHERE id = $3";
    try {
        const result = await pool.query(sql, [name, birthYear, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Director not found or no changes made." });
        }
        res.json({ updatedID: id, name, birthYear });
    } catch (error) {
        console.error("PUT /directors/:id DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// DELETE /directors/:id (PROTECTED - Hanya Admin) (Refaktorisasi Async)
app.delete('/directors/:id', [authenticateToken, authorizeRole('admin')], async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM directors WHERE id = $1";
    
    try {
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Director not found." });
        }
        res.json({ deletedID: id, message: "Director berhasil dihapus" });
    } catch (error) {
        console.error("DELETE /directors/:id DB Error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// ================== ERROR HANDLER / 404 ==================
// Handler 404 HARUS diletakkan sebagai yang terakhir setelah SEMUA route Anda.
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Jalankan server HANYA SETELAH database diinisialisasi
// Ini adalah alur yang benar untuk DB asinkron
initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Running on http://localhost:${port}`);
            console.log("Database successfully connected and initialized.");
        });
    })
    .catch((error) => {
        // Log error dan exit jika inisialisasi DB gagal
        console.error("FATAL: Gagal menjalankan server karena DB Error:", error.message);
        process.exit(1); 
    });