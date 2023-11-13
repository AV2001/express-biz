const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
    const results = await db.query('SELECT code, name FROM companies;');
    return res.status(200).json({ companies: results.rows });
});

module.exports = router;
