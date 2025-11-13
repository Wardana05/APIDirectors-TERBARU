// middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware Autentikasi (memverifikasi token & melampirkan user/role ke req)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            // Error 403: Forbidden (Token tidak valid/expired)
            return res.status(403).json({ error: 'Token tidak valid' });
        }
        // decodedPayload.user sekarang berisi {id, username, role}
        req.user = decodedPayload.user; 
        next();
    });
}

// Middleware Otorisasi (BARU: memverifikasi peran)
function authorizeRole(role) {
    return (req, res, next) => {
        // Pastikan middleware ini dijalankan SETELAH authenticateToken
        if (req.user && req.user.role === role) {
            next(); // Peran cocok, lanjutkan
        } else {
            // Error 403: Forbidden (Izin tidak memadai)
            return res.status(403).json({ error: 'Akses Dilarang: Peran tidak memadai' });
        }
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};