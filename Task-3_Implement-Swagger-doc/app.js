const express = require('express');
// const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express');
// const { get } = require('http');
// const { toNamespacedPath } = require('path');
let data = require("./database");
// const { Console } = require('console');


// SwaggerJs options with UI end-point
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Integrating Swagger UI with NodeJs and API endpoints checking',
            // version
        },
        servers: [
            {
                url: 'http://localhost:3000/'
            }
        ]
    },
    apis: ['./app.js']
}

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(bodyParser.json());


// Swagger syntax for documenting API's
/**
 * @openapi
 * /api/userdata:
 *   get:
 *     tags:
 *       - Getting all user data
 *     description: API responsible for fetching all the data from the database
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Requested resource not found
 *       500:
 *         description: Internal Server Error
 * 
 *   post:
 *     tags:
 *       - Post new user data to the database
 *     description: API responsible for pushing new user data to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *               age:
 *                 type: integer
 *                 required: true
 *               gender:
 *                 type: string
 *                 required: true
 *               socialStatus:
 *                 type: string 
 *                 required: true
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                 socialStatus:
 *                   type: string 
 *       400:
 *         description: Bad Request
 *       208:
 *         description: Already Reported
 */


/**
 * @openapi
 * /api/userdata/{id}:
 *   delete:
 *     tags:
 *       - Delete User
 *     description: API responsible for removing a particular user with the given Id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Index of the user
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                 socialStatus:
 *                   type: string 
 *       404:
 *         description: Not Found
 * 
 *   put:
 *     tags:
 *       - Modify user data
 *     description: API responsible for modifying the user data based on the given User Index 
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Index of the user
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               socialStatus:
 *                 type: string 
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 *       400:
 *         description: Bad Request
 */


// Endpoint for getting users data
app.get('/api/userdata', async (req, res) => {
    try {
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for adding user data to the database
app.post('/api/userdata', (req, res) => {

    let dataLength = data.length;
    const { name, age, gender, socialStatus, email } = req.body;

    if(!name || !age || !gender || !socialStatus|| !email) {
        return res.status(400).json({ error: 'Kindly fill all required details' });
    }

    const isEmailFound = data.findIndex(user => user.email === req.body.email);
    if(isEmailFound != -1) {
        return res.status(208).json({error: `User with ${req.body.email} email already present`})
    }

    dataLength += 1;
    const newUser = {dataLength, name, age, gender ,socialStatus, email};
    data.push(newUser);
    console.log(data);
    res.status(200).json(newUser);
});

// Endpoint for Modifying data to the database
app.put('/api/userdata/:id', (req, res) => {

    const userId = parseInt(req.params.id);
    const { name, age, gender, socialStatus } = req.body;
    const dataLength = data.length;
    
    if(dataLength < userId) {
        return res.status(400).json({error: `${userId} is invalid`});
    }

    // Find user by ID
    const userIndex = data.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    data[userIndex] = {
        ...data[userIndex],
        name: name || data[userIndex].name,
        age: age || data[userIndex].age,
        gender: gender || data[userIndex].gender,
        socialStatus: age || data[userIndex].socialStatus,
    };

    res.status(200).json(data[userIndex]);
});

// Endpoint for removing the user from database
app.delete('/api/userdata/:id', (req, res) => {

    const userId = parseInt(req.params.id);

    const userIndex = data.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(data[userIndex]);

    const filteredData = data.filter(user => {
        return user.id != userId;
    })

    data = filteredData;

    res.status(200).json(data[userIndex]);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
