DROP TABLE IF EXISTS companies CASCADE;

DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS industries CASCADE;

DROP TABLE IF EXISTS companies_industries;

CREATE TABLE
    companies (
        code text PRIMARY KEY,
        name text NOT NULL UNIQUE,
        description text
    );

CREATE TABLE
    invoices (
        id serial PRIMARY KEY,
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        amt float NOT NULL,
        paid boolean DEFAULT false NOT NULL,
        add_date date DEFAULT CURRENT_DATE NOT NULL,
        paid_date date
    );

CREATE TABLE
    industries (code text PRIMARY KEY, name text NOT NULL UNIQUE);

CREATE TABLE
    companies_industries (
        company_code text REFERENCES companies (code),
        industry_code text REFERENCES industries (code),
        PRIMARY KEY (company_code, industry_code)
    );

INSERT INTO
    companies
VALUES
    ('apple', 'Apple Computer', 'Maker of OSX.'),
    ('ibm', 'IBM', 'Big blue.');

INSERT INTO
    invoices (comp_code, amt, paid, paid_date)
VALUES
    ('apple', 100, false, null),
    ('apple', 200, false, null),
    ('apple', 300, true, '2018-01-01'),
    ('ibm', 400, false, null);

INSERT INTO
    industries (code, name)
VALUES
    ('acct', 'Accounting'),
    ('mark', 'Marketing');

INSERT INTO
    companies_industries (company_code, industry_code)
VALUES
    ('apple', 'acct'),
    ('apple', 'mark')
