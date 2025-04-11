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


        return res.status(200).json({ message: 'Login successful!', username });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Create group route
app.post('/groups', async (req, res) => {
    const { name, description, code, createdBy } = req.body;

    if (!name || !description || !code || !createdBy) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const groupsRef = db.ref('groups');
        const newGroupRef = groupsRef.push(); // Auto-generate key
        const groupData = {
            name,
            description,
            code,
            createdBy,
            members: [createdBy],
            createdAt: Date.now()
        };

        await newGroupRef.set(groupData);

        return res.status(200).json({ message: 'Group created successfully!', groupId: newGroupRef.key });
    } catch (err) {
        console.error('Group creation error:', err);

        return res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/groups/join', async (req, res) => {
    const { code, username } = req.body;

app.delete('/DeleteEvents/:id', async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ error: 'Event name is required' });
    }
  
    try {
      const eventRef = db.ref(`Events/ID/${id}`);
      
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
  
  app.put('/EditEvents/:id', async (req, res) => {
    const { id } = req.params;
    const { date, groupID, location, time, category, notes, eventName} = req.body;
  
    if (!id) {
      return res.status(400).json({ error: 'Event name is required in URL' });
    }
  
    try {
      const eventRef = db.ref(`Events/ID/${id}`);
      const snapshot = await eventRef.once('value');
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Update fields
      await eventRef.update({
        eventName : eventName, 
        Date: date,
        GroupID: groupID,
        Location: location,
        Time: time,
        Notes: notes,
        Category: category,
      });
  
      return res.status(200).json({ message: 'Event updated successfully' });
    } catch (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  

    if (!code || !username) {
        return res.status(400).json({ error: 'Group code and username are required' });
    }

    try {
        const groupsRef = db.ref('groups');
        const snapshot = await groupsRef.once('value');
        let found = false;

        snapshot.forEach(child => {
            const group = child.val();
            if (group.code === code) {
                found = true;
                const members = group.members || [];

                if (members.includes(username)) {
                    return res.status(409).json({ error: 'User already a member of this group' });
                }

                members.push(username);
                db.ref(`groups/${child.key}/members`).set(members);

                return res.status(200).json({ message: 'Successfully joined group!', groupId: child.key });
            }
        });

        if (!found) {
            return res.status(404).json({ error: 'Group not found with provided code' });
        }
    } catch (err) {
        console.error('Join group error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Get groups for a specific user
app.get('/groups/user/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const groupsRef = db.ref('groups');
        const snapshot = await groupsRef.once('value');

        const userGroups = [];

        snapshot.forEach(child => {
            const group = child.val();
            if (group.createdBy === username || (group.members && group.members.includes(username))) {
                userGroups.push({
                    id: child.key,
                    ...group
                });
            }
        });

        return res.status(200).json(userGroups);
    } catch (err) {
        console.error('Fetch user groups error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete (disband) a group
app.delete('/groups/:groupId', async (req, res) => {
    const { groupId } = req.params;
    try {
        const groupRef = db.ref(`groups/${groupId}`);
        const snapshot = await groupRef.once('value');
        if (!snapshot.exists()) return res.status(404).json({ error: 'Group not found' });

        await groupRef.remove();
        res.status(200).json({ message: 'Group disbanded successfully' });
    } catch (err) {
        console.error('Disband group error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Leave a group
app.post('/groups/:groupId/leave', async (req, res) => {
    const { groupId } = req.params;
    const { username } = req.body;

    if (!username) return res.status(400).json({ error: 'Username required' });

    try {
        const groupRef = db.ref(`groups/${groupId}`);
        const snapshot = await groupRef.once('value');
        if (!snapshot.exists()) return res.status(404).json({ error: 'Group not found' });

        const group = snapshot.val();
        const updatedMembers = group.members.filter(member => member !== username);

        await groupRef.update({ members: updatedMembers });
        res.status(200).json({ message: 'Left the group successfully' });
    } catch (err) {
        console.error('Leave group error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Kick a user from a group
app.post('/groups/:groupId/kick', async (req, res) => {
    const { groupId } = req.params;
    const { targetUsername } = req.body;
  
    if (!targetUsername) return res.status(400).json({ error: 'Target username required' });
  
    try {
      const groupRef = db.ref(`groups/${groupId}`);
      const snapshot = await groupRef.once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: 'Group not found' });
  
      const group = snapshot.val();
  
      // Don't allow creator to be kicked
      if (targetUsername === group.createdBy) {
        return res.status(403).json({ error: 'Cannot kick the group creator' });
      }
  
      const updatedMembers = group.members.filter((m) => m !== targetUsername);
      await groupRef.update({ members: updatedMembers });
  
      res.status(200).json({ message: `Kicked ${targetUsername} from the group` });
    } catch (err) {
      console.error('Kick user error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
