process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('openai', 'OpenAI', 'We popularized the term "LLMs".') RETURNING *`
    );
    testCompany = result.rows[0];
    result = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('openai', 5000, 't', '2023-12-12', null) RETURNING *`
    );
    testInvoice = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM INVOICES;`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /invoices', () => {
    test('Get all invoices', async () => {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoices: [
                { id: testInvoice.id, comp_code: testInvoice.comp_code },
            ],
        });
    });
});
