require('dotenv').config();  // This line loads environment variables from the .env file
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// Helper function to load admin credentials
const loadAdminCredentials = () => {
    try {
        return JSON.parse(fs.readFileSync('admin_credentials.json', 'utf8'));
    } catch (error) {
        console.error("Error loading admin credentials:", error);
        return null;
    }
};

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
    const credentials = loadAdminCredentials();
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = decodedCredentials.split(':');

    if (username === credentials.login && password === credentials.password) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Validate email format
const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
};

// Validate date format (YYYY/MM/DD)
const validateDate = (date) => {
    const re = /^\d{4}\/\d{2}\/\d{2}$/;
    return re.test(date);
};

// Validate participant data
const validateParticipantData = ({ email, firstname, lastname, dob, companyname, salary, currency, country, city }) => {
    if (!email || !firstname || !lastname || !dob || !companyname || !salary || !currency || !country || !city) {
        return 'All fields are required.';
    }
    if (!validateEmail(email)) {
        return 'Invalid email format.';
    }
    if (!validateDate(dob)) {
        return 'Date of birth must be in YYYY/MM/DD format.';
    }
    return null;
};

const participants = {};

app.post('/participants/add', basicAuth, (req, res) => {
    const error = validateParticipantData(req.body);
    if (error) {
        return res.status(400).json({ error });
    }
    participants[req.body.email] = { ...req.body, active: true };
    res.status(201).json({ message: 'Participant added successfully', data: participants[req.body.email] });
});

app.get('/participants', basicAuth, (req, res) => {
    res.json({ participants });
});
app.get('/participants/details', basicAuth, (req, res) => {
    const activeParticipants = Object.values(participants).filter(p => p.active).map(({ firstname, lastname }) => ({ firstname, lastname }));
    res.json(activeParticipants);
});

app.get('/participants/details/:email', basicAuth, (req, res) => {
    const participant = participants[req.params.email];
    if (!participant || !participant.active) {
        return res.status(404).json({ error: 'Participant not found or inactive' });
    }
    const { firstname, lastname } = participant;
    res.json({ firstname, lastname });
});

app.get('/participants/work/:email', basicAuth, (req, res) => {
    const participant = participants[req.params.email];
    if (!participant || !participant.active) {
        return res.status(404).json({ error: 'Participant not found or inactive' });
    }
    const { companyname, salary, currency } = participant;
    res.json({ companyname, salary, currency });
});

app.get('/participants/home/:email', basicAuth, (req, res) => {
    const participant = participants[req.params.email];
    if (!participant || !participant.active) {
        return res.status(404).json({ error: 'Participant not found or inactive' });
    }
    const { country, city } = participant;
    res.json({ country, city });
});

app.delete('/participants/:email', basicAuth, (req, res) => {
    if (!participants[req.params.email]) {
        return res.status(404).json({ error: 'Participant not found' });
    }
    delete participants[req.params.email];
    res.status(200).json({ message: 'Participant deleted successfully' });
});

app.put('/participants/:email', basicAuth, (req, res) => {
    if (!participants[req.params.email]) {
        return res.status(404).json({ error: 'Participant not found' });
    }
    const { email, firstname, lastname, dob, companyname, salary, currency, country, city } = req.body;
    if (!email || !firstname || !lastname || !dob || !companyname || !salary || !currency || !country || !city) {
        return res.status(400).json({ error: 'All fields are required and must be valid.' });
    }
    participants[req.params.email] = { ...req.body, active: true }; // Maintain 'active' status on update
    res.json({ message: 'Participant updated successfully', data: participants[req.params.email] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});