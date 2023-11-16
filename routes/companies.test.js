process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('openai', 'OpenAI', 'We popularized the term "LLMs".') RETURNING code, name`
    );
    testCompany = result.rows[0];
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
        expect(response.body).toEqual({ companies: [testCompany] });
    });
});
