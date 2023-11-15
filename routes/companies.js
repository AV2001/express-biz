const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next) => {
    const results = await db.query('SELECT code, name FROM companies');
    return res.status(200).json({ companies: results.rows });
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code: companyCode } = req.params;
        const results = await db.query(
            `SELECT c.code, c.name, c.description, ARRAY_AGG(i.id) AS invoices FROM companies c JOIN invoices i ON c.code = i.comp_code WHERE code=$1 GROUP BY c.code`,
            [companyCode]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(
                `Can't find a company whose code is ${companyCode}.`,
                404
            );
        }
        const { code, name, description, invoices } = results.rows[0];
        return res
            .status(200)
            .json({ company: { code, name, description, invoices } });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
            [code, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(
                `Can't find a company whose code is ${code}.`,
                404
            );
        }
        return res.status(200).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        // Check to see if company exists
        const checkCompany = await db.query(
            `SELECT * FROM companies WHERE code=$1`,
            [code]
        );

        if (checkCompany.rows.length === 0) {
            throw new ExpressError(
                `Can't find a company whose code is ${code}.`,
                404
            );
        }

        // If company exists, proceed with the deletion
        await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        return res.status(200).json({ status: 'deleted' });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
