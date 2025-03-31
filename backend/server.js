const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); //To hash passwords

const app = express();
const port = 3500;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
// MySQL Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Asu21244',
    database: 'GroupToGo'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
// API Endpoint to handle user registration
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message:'Username and password are required'});
    }
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const INSERT_USER_QUERY = `INSERT INTO user (username, password) VALUES (?, ?)`;
        db.query(INSERT_USER_QUERY, [username, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({error:'Error inserting user'});
                return;
            }
            console.log('User inserted successfully');
            res.status(200).json({message:'User inserted successfully'});
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({error:'Error hashing password'});
    }
});

app.post('/login', async(req, res) => {
    console.log("Received request body:", req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({message:'Username and password are required'});
    }
    const SELECT_USER_QUERY = `SELECT * FROM user WHERE username = ?`;
    
    try {
        const results = await new Promise((resolve, reject) => {
            db.query(SELECT_USER_QUERY, [username], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found. Please enter another username or sign up!' });
        }

        const user = results[0];

        // Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        return res.status(200).json({ message: 'Login successful!' });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Error processing request' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});