require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const saltRounds = 5

const app = express();
app.use(express.json());

const users = [
    { id: 1, username: 'het', password: '123#' },
    { id: 2, username: 'prakash', password: 'jnfR$' },
];

const secretKey = process.env.SECRET; 

// Middleware to verify the JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}

// Endpoint for user registration
app.post('/register', async(req, res) => {
    let { username, password } = req.body;

    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    users.push({ id: users.length + 1, username, password: hash });
    res.json({ id: users.length + 1, username, password: hash });
    return res.status(201).send('User registered successfully');  // Successfull
});

//----------------------------------------------------------------------------------------------------------
// Endpoint for user login with hashed password

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         const user = users.find(user => user.username === username);
//         if (!user) {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }
        
//         const passwordMatch = await bcrypt.compare(password, user.password);  // password comparison with stored hashed form
//         if (!passwordMatch) {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }

//         const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey);
//         return res.json({ message: 'Login successful', userId: user.id, username: user.username, accessToken });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });
//----------------------------------------------------------------------------------------------------------

// Endpoint for user login with password check
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = users.find(user => user.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const passwordMatch = users.find(user => user.password === password)
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey);
        return res.json({ message: 'Login successful', userId: user.id, username: user.username, accessToken });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json(users);
});

// Logout endpoint 
app.post('/logout', (req, res) => {
   try {
        // req.session.destroy(); if maintaining the session in application
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
