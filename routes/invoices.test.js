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

describe('GET /invoices/:id', () => {
    test('Get an invoice', async () => {
        const response = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(response.statusCode).toBe(200);
        let { id, amt, paid, add_date, paid_date } = testInvoice;
        const { code, name, description } = testCompany;
        add_date = add_date.toISOString();
        expect(response.body).toEqual({
            invoice: {
                id,
                amt,
                paid,
                add_date,
                paid_date,
                company: { code, name, description },
            },
        });
    });

    test('Return 404 if invalid id is passed', async () => {
        const response = await request(app).get('/invoices/100');
        expect(response.statusCode).toBe(404);
    });
});

describe('POST /invoices', () => {
    test('Create an invoice', async () => {
        const newInvoice = { comp_code: 'openai', amt: 3000 };
        const response = await request(app).post('/invoices').send(newInvoice);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: newInvoice.comp_code,
                amt: newInvoice.amt,
                paid: expect.any(Boolean),
                add_date: '2023-12-12T20:00:00.000Z',
                paid_date: null,
            },
        });
    });
});

describe('PUT /invoices/:id', () => {
    test('Update an invoice', async () => {
        const newInvoice = { amt: 3000 };
        const response = await request(app)
            .put(`/invoices/${testInvoice.id}`)
            .send(newInvoice);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: testInvoice.comp_code,
                amt: newInvoice.amt,
                paid: testInvoice.paid,
                add_date: testInvoice.add_date.toISOString(),
                paid_date: testInvoice.paid_date,
            },
        });
    });

    test('Return 404 if invalid id is passed', async () => {
        const response = await request(app).put('/invoices/100');
        expect(response.statusCode).toBe(404);
    });
});

describe('DELETE /invoices/:id', () => {
    test('Delete an invoice', async () => {
        const response = await request(app).delete(
            `/invoices/${testInvoice.id}`
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'deleted' });
    });

    test('Return 404 if invalid id is passed', async () => {
        const response = await request(app).delete('/invoices/100');
        expect(response.statusCode).toBe(404);
    });
});
