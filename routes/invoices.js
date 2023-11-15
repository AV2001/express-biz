const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.status(200).json({ invoices: results.rows });
});

module.exports = router;
