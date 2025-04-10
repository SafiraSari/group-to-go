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

app.post('/event', async (req, res) => {
    const { date, groupID, location, eventName,time, category} = req.body;

    if (!date || !groupID || !location || !eventName|| !time || !category) {
        return res.status(400).json({ error: 'All fields (id, date, groupID, location, eventName, time) are required' });
    }

    try {
        
        const eventRef = db.ref(`Events/ID/${eventName}`);

        // Write the event data
        await eventRef.set({
            Date: date,
            GroupID: groupID,
            Location: location,
            eventName: eventName,
            Category: category,
            Time: time
        });

        // Send response after writing to the database
        return res.status(201).json({
            message: 'Event created successfully',
            data: {
                date,
                groupID,
                location,
                eventName,
            }
        });
    } catch (err) {
        console.error('Error writing event:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/events', async (req, res) => {
    try {
        // Reference to the entire Events node
        const eventsRef = db.ref('Events/ID');

        // Get the events data from Firebase
        const snapshot = await eventsRef.once('value');
        
        // Check if any events exist
        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'No events found' });
        }

        // Get the events data as an object
        const eventsData = snapshot.val();

        // Return the events in an array format
        const events = Object.keys(eventsData).map(id => ({
            id,
            ...eventsData[id]
        }));

        // Send the event data in the response
        return res.status(200).json({
            message: 'Events retrieved successfully',
            data: events
        });
    } catch (err) {
        console.error('Error retrieving events:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/events/:eventName', async (req, res) => {
    const { eventName } = req.params;
  
    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required' });
    }
  
    try {
      const eventRef = db.ref(`Events/ID/${eventName}`);
      
      const snapshot = await eventRef.once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      await eventRef.remove();
  
      return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put('/events/:eventName', async (req, res) => {
    const { eventName } = req.params;
    const { date, groupID, location, time, category } = req.body;
  
    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required in URL' });
    }
  
    try {
      const eventRef = db.ref(`Events/ID/${eventName}`);
      const snapshot = await eventRef.once('value');
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Update fields
      await eventRef.update({
        Date: date,
        GroupID: groupID,
        Location: location,
        Time: time,
        Category: category,
      });
  
      return res.status(200).json({ message: 'Event updated successfully' });
    } catch (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
