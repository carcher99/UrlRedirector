const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Load the server
const app = require('../server'); // Adjust the path as necessary

// Placeholder for redirection data
let redirects = {};

// Load redirects from file (if it exists)
const redirectsFilePath = path.join(__dirname, '../redirects.json');
if (fs.existsSync(redirectsFilePath)) {
    const data = fs.readFileSync(redirectsFilePath, 'utf8');
    redirects = JSON.parse(data);
}

// Test suite for API endpoints
describe('API Endpoints', () => {
    beforeEach(() => {
        redirects = {}; // Reset redirects before each test
    });

    test('GET /api/redirects should return all redirects', async () => {
        const response = await request(app).get('/api/redirects');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(redirects);
    });

    test('POST /api/redirects should add a new redirect', async () => {
        const newRedirect = { acronym: 'test', destination: 'https://www.google.com' };
        const response = await request(app)
            .post('/api/redirects')
            .send(newRedirect)
            .set('Accept', 'application/json');

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Redirect saved');

        // Verify that the redirect was added
        const getResponse = await request(app).get('/api/redirects');
        expect(getResponse.body).toHaveProperty(newRedirect.acronym, newRedirect.destination);
    });

    test('DELETE /api/redirects/:acronym should delete a redirect', async () => {
        const newRedirect = { acronym: 'test', destination: 'https://www.google.com' };
        await request(app)
            .post('/api/redirects')
            .send(newRedirect)
            .set('Accept', 'application/json');

        const deleteResponse = await request(app).delete('/api/redirects/test');
        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.text).toBe('Redirect deleted');

        // Verify that the redirect was deleted
        const getResponse = await request(app).get('/api/redirects');
        expect(getResponse.body).not.toHaveProperty('test');
    });
});
