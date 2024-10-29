const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
    async register(req, res) {
        try {
            const { email, password, role = 'user' } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
                [email, hashedPassword, role]
            );

            const token = jwt.sign(
                { userId: result.rows[0].id, role: result.rows[0].role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ user: result.rows[0], token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = authController;