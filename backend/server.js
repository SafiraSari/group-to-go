const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt'); //To hash passwords
const db = require('../backend/FirebaseConfig');

const app = express();
const port = 3500;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

require('dotenv').config();
// API Endpoint to handle user registration
app.post('/signup', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message:'Username and password are required'});
    }
    const usersRef = db.ref('users');
    const userRef = usersRef.child(username);

    try {
        // Check if user already exists
        const snapshot = await userRef.once('value');
        if (snapshot.exists()) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userRef.set({ password: hashedPassword });

        return res.status(200).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({message:'Username and password are required'});
    }
    const userRef = db.ref(`users/${username}`);

    try {
        const snapshot = await userRef.once('value');
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = snapshot.val();
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        return res.status(200).json({ message: 'Login successful!' });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});