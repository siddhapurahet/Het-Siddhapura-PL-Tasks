require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;


// Dummy data for non-authenticated endpoints
const publicData = [
    { id: 1, name: 'Public API 1' },
    { id: 2, name: 'Public API 2' },
    { id: 3, name: 'Public API 3' }
];

// Dummy data for authenticated endpoints
const privateData = [
    { id: 1, name: 'Private API 1' },
    { id: 2, name: 'Private API 2' },
    { id: 3, name: 'Private API 3' }
];

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' }); // Forbidden
        req.user = user;
        next();
    });
}


// Dummy data API endpoint for public endpoint
app.get('/api/public', (req, res) => {
    try {
        return res.json(publicData);
    }
    catch(error) {
        res.status(500).json({error: "Intenal Server Error"});
    }
});

// API endpoint that requires authentication
app.get('/api/private', authenticateToken, (req, res) => {
    try {

        return res.json(privateData);
    }
    catch(error) {
        res.status(500).json({error: "Intenal Server Error"});
    }
});

// Generating JWT token API endpoint  (for getting token in response so can be used as request when accessing private API )
app.post('/api/login', (req, res) => {
    const user = { id: privateData.length+1, username: 'user1' };
    console.log(user);
    const token = jwt.sign(user, secretKey);
    res.json({ token });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
