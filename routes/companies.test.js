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
    await db.query(`DELETE FROM invoices;`);
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

describe('GET /companies/:code', () => {
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

describe('POST /companies', () => {
    test('Create a company', async () => {
        const newCompany = {
            code: 'google',
            name: 'Google',
            description: 'The best we could is Gemini.',
        };
        const response = await request(app).post('/companies').send(newCompany);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ company: newCompany });
    });
});

describe('PUT /companies/:code', () => {
    test('Update a company', async () => {
        const newCompany = {
            code: 'openai',
            name: 'OpenAI',
            description: 'GPT 5 is coming soon!',
        };
        const response = await request(app)
            .put(`/companies/${testCompany.code}`)
            .send(newCompany);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ company: newCompany });
    });

    test('Return 404 if invalid code is passed', async () => {
        const response = await request(app).put('/companies/microsoft');
        expect(response.statusCode).toBe(404);
    });
});

describe('DELETE /companies/:code', () => {
    test('Delete a company', async () => {
        const response = await request(app).delete(
            `/companies/${testCompany.code}`
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'deleted' });
    });

    test('Return 404 if invalid code is passed', async () => {
        const response = await request(app).delete('/companies/microsoft');
        expect(response.statusCode).toBe(404);
    });
});
