const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next) => {
    const results = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.status(200).json({ invoices: results.rows });
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id: invoiceId } = req.params;
        const invoiceData = await db.query(
            `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description FROM invoices i JOIN companies c ON i.comp_code = c.code WHERE id=$1`,
            [invoiceId]
        );
        if (invoiceData.rows.length === 0) {
            throw new ExpressError(
                `Can't find the invoice with id ${invoiceId}.`,
                404
            );
        }

        const { id, amt, paid, add_date, paid_date, code, name, description } =
            invoiceData.rows[0];

        const response = {
            invoice: {
                id,
                amt,
                paid,
                add_date,
                paid_date,
                company: {
                    code,
                    name,
                    description,
                },
            },
        };
        return res.status(200).json(response);
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code: invoiceCompCode, amt: invoiceAmt } = req.body;
        const invoiceData = await db.query(
            `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`,
            [invoiceCompCode, invoiceAmt]
        );
        const { id, comp_code, amt, paid, add_date, paid_date } =
            invoiceData.rows[0];
        return res.status(201).json({
            invoice: { id, comp_code, amt, paid, add_date, paid_date },
        });
    } catch (e) {
        return next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paidDate = null;

        const result = await db.query(
            `SELECT paid FROM invoices WHERE id = $1`,
            [id]
        );

        // Check whether id is valid
        if (result.rows.length === 0) {
            throw new ExpressError(
                `Can't find the invoice with id ${id}.`,
                404
            );
        }

        const currentPaidData = result.rows[0].paid_date;

        if (!currentPaidData && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currentPaidData;
        }

        const invoiceData = await db.query(
            `UPDATE invoices
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]
        );

        return res.status(200).json({ invoice: invoiceData.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
            id,
        ]);
        if (results.rows.length === 0) {
            throw new ExpressError(
                `Can't find the invoice with id ${id}.`,
                404
            );
        }

        await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        return res.status(200).json({ status: 'deleted' });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
