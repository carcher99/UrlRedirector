const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 80;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder for redirection data
let redirects = {};

// Load redirects from file (if it exists)
const redirectsFilePath = path.join(__dirname, 'redirects.json');
if (fs.existsSync(redirectsFilePath)) {
    const data = fs.readFileSync(redirectsFilePath, 'utf8');
    redirects = JSON.parse(data);
}

// Save redirects to file
const saveRedirects = () => {
    try {
        //console.log('Attempting to save redirects:', JSON.stringify(redirects, null, 2));
        fs.writeFileSync(redirectsFilePath, JSON.stringify(redirects, null, 2), 'utf8');
        console.log('fs.writeFileSync executed.');
        console.log('Redirects saved to file.');
    } catch (error) {
        console.error('Error saving redirects to file:', error);
    }
};

app.get('/:acronym', (req, res) => {
    console.log('GET request received for acronym:', req.params.acronym); // Log the incoming request
    const acronym = req.params.acronym;
    const destination = redirects[acronym];

    if (destination) {
        destination.count += 1; // Increment the usage count
        console.log(JSON.stringify(destination));
        saveRedirects(); // Save the updated redirects to file
        res.redirect(302, destination.url); // Redirect to the URL
    } else {
        res.status(404).send('Shortcut not found');
    }
});

// API endpoint to get all redirects
app.get('/api/redirects', (req, res) => {
    console.log('GET /api/redirects endpoint hit with body:', req.body);
    res.json(redirects);
});

// API endpoint to add or update a redirect
app.post('/api/redirects', (req, res) => {
    console.log('POST /api/redirects endpoint hit with body:', req.body);
    const { acronym, destination } = req.body; // Extract acronym and destination from the request body
    console.log('Received acronym:', acronym, 'and destination:', destination); // Log the received data
    if (acronym && destination) {
        redirects[acronym] = {
            url: destination,
            count: 0 // Initialize count to 0 for new redirects
        };
        saveRedirects();
        res.status(200).send('Redirect saved');
    } else {
        res.status(400).send('Acronym and destination are required');
    }
});

// API endpoint to delete a redirect
app.delete('/api/redirects/:acronym', (req, res) => {
    console.log('DELETE /api/redirects/:acronym endpoint hit');
    const acronym = req.params.acronym;
    if (redirects[acronym]) {
        delete redirects[acronym];
        saveRedirects();
        res.status(200).send('Redirect deleted');
    } else {
        res.status(404).send('Shortcut not found');
    }
});


module.exports = app; // Export the app for testing

if (require.main === module) {
    // Start the server only if this file is run directly
    app.listen(port, () => {
        console.log(`URL Redirector server listening at http://localhost:${port}`);
    });
}
