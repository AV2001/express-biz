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
});

afterAll(async () => {
    await db.end();
});

describe('GET /companies', () => {
    test('Get all companies', async () => {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            companies: [{ code: testCompany.code, name: testCompany.name }],
        });
    });
});

describe('GET /companies/:id', () => {
    test('Get company by code', async () => {
        const response = await request(app).get(
            `/companies/${testCompany.code}`
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company: {
                code: testCompany.code,
                name: testCompany.name,
                description: testCompany.description,
                invoices: [testInvoice.id],
            },
        });
    });

    test('Return 404 if invalid code is passed', async () => {
        const response = await request(app).get('/companies/microsoft');
        expect(response.statusCode).toBe(404);
    });
});
