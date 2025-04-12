
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


//for Expenses tab
// Create expense
app.post('/expenses', async (req, res) => {
    try {
      const { eventName, amount, groupId, createdBy, splitAmong } = req.body;
  
      if (!eventName || !amount || !groupId || !createdBy || !splitAmong) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const expenseRef = db.ref(`expenses/${groupId}`).push();
      const newExpense = {
        eventName,
        amount,
        splitAmong,
        createdBy,
        createdAt: Date.now()
      };
  
      await expenseRef.set(newExpense);
      res.status(200).json({ message: "Expense saved", expense: newExpense, id: expenseRef.key });
    } catch (err) {
      console.error("Error saving expense:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get user expenses
  app.get("/expenses/user/:username", async (req, res) => {
    const { username } = req.params;
  
    try {
      const groupsSnap = await db.ref("groups").once("value");
      const expensesSnap = await db.ref("expenses").once("value");
  
      const userGroups = [];
  
      groupsSnap.forEach(groupChild => {
        const group = groupChild.val();
        if (group.members?.includes(username)) {
          userGroups.push(group.code); // <-- use `code` not Firebase key
        }
      });
  
      const userExpenses = [];
  
      userGroups.forEach(code => {
        const groupExpenses = expensesSnap.child(code);
        if (groupExpenses.exists()) {
          groupExpenses.forEach(expChild => {
            const exp = expChild.val();
            userExpenses.push({
              ...exp,
              id: expChild.key,
              groupId: code
            });
          });
        }
      });
  
      res.status(200).json(userExpenses);
    } catch (err) {
      console.error("Error fetching user expenses:", err);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });
  
  // Get members of group
  app.get('/groups/:code/members', async (req, res) => {
    const { code } = req.params;
    try {
      const snapshot = await db.ref('groups').orderByChild('code').equalTo(code).once('value');
      if (!snapshot.exists()) return res.status(404).json({ error: 'Group not found' });
  
      const groupData = Object.values(snapshot.val())[0];
      return res.json({ members: groupData.members || [] });
    } catch (err) {
      console.error('Error fetching members:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get groups for a user
  app.get("/expenses/user/:username", async (req, res) => {
    const { username } = req.params;
    try {
      const groupSnap = await db.ref("groups").once("value");
      const allExpenses = [];
      const expenseSnap = await db.ref("expenses").once("value");
  
      groupSnap.forEach((groupChild) => {
        const group = groupChild.val();
        const groupId = groupChild.key;
        const isMember = group.members?.includes(username);
  
        if (isMember && expenseSnap.child(groupId).exists()) {
          expenseSnap.child(groupId).forEach((expChild) => {
            const exp = expChild.val();
            allExpenses.push({
              ...exp,
              id: expChild.key,
              groupId,
            });
          });
        }
      });
  
      res.status(200).json(allExpenses);
    } catch (err) {
      console.error("Error fetching user expenses:", err);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });
  app.delete("/expenses/:groupCode/:expenseId", async (req, res) => {
    const { groupCode, expenseId } = req.params;
  
    if (!groupCode || !expenseId) {
      return res.status(400).json({ error: "Missing group code or expense ID" });
    }
  
    try {
      const expenseRef = db.ref(`expenses/${groupCode}/${expenseId}`);
      const snapshot = await expenseRef.once("value");
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: "Expense not found" });
      }
  
      await expenseRef.remove();
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (err) {
      console.error("Error deleting expense:", err);
      res.status(500).json({ error: "Failed to delete expense" });
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
 //polls

 app.post('/polls', async (req, res) => {
  const { pollName, question, notes, options, groupId, category, createdBy } = req.body;

  if (!pollName || !question || !options || !groupId || !category || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Save poll directly under "polls/" instead of "polls/<groupId>/..."
    const pollsRef = db.ref("polls").push();
    const newPoll = {
      pollName,
      question,
      notes: notes || "",
      options,
      category,
      createdBy,
      groupId, // Keep groupId for filtering
      createdAt: Date.now(),
      status: "Pending",
      votes: {}  // Empty initially
    };

    await pollsRef.set(newPoll);
    return res.status(200).json({ message: "Poll saved", poll: newPoll, id: pollsRef.key });
  } catch (err) {
    console.error("Error saving poll:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/polls/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const groupsRef = db.ref("groups");
    const groupsSnap = await groupsRef.once("value");

    const userGroupCodes = {}; // key: groupCode, value: { name, members }
    groupsSnap.forEach(groupChild => {
      const group = groupChild.val();
      if (group.createdBy === username || (group.members && group.members.includes(username))) {
        userGroupCodes[group.code] = {
          name: group.name,
          members: group.members || [],
        };
      }
    });

    //  Now we match by poll.groupId === group.code
    const pollsRef = db.ref("polls");
    const pollsSnap = await pollsRef.once("value");

    const result = [];

    pollsSnap.forEach(pollChild => {
      const poll = pollChild.val();
      const groupCode = poll.groupId;
      const groupInfo = userGroupCodes[groupCode];

      if (groupInfo) {
        const hasVoted = poll.votes && poll.votes[username];
        const totalVotes = poll.votes ? Object.keys(poll.votes).length : 0;

        result.push({
          ...poll,
          id: pollChild.key,
          groupCode,
          groupName: groupInfo.name,
          hasVoted,
          status: poll.status || 'pending',
          totalMembers: groupInfo.members.length,
          totalVotes
        });
      }
    });

    console.log(`Found ${result.length} polls for user ${username}`);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching polls:", err);
    return res.status(500).json({ error: "Failed to fetch polls" });
  }
});

app.post('/polls/:pollId/vote', async (req, res) => {
  const { pollId } = req.params;
  const { username, option, groupId } = req.body;

  if (!username || !option || !groupId) {
    return res.status(400).json({ error: 'Username, option, and groupId are required' });
  }

  try {
    // Get the group to check members
    const groupRef = db.ref(`groups`);
    const groupSnap = await groupRef.once('value');
    let targetGroup = null;

    groupSnap.forEach(child => {
      const g = child.val();
      if (g.code === groupId) {
        targetGroup = { ...g, key: child.key };
      }
    });

    if (!targetGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get the poll from flat /polls
    const pollRef = db.ref(`polls/${pollId}`);
    const pollSnap = await pollRef.once('value');

    if (!pollSnap.exists()) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = pollSnap.val();

    // Initialize votes if not present
    if (!poll.votes) {
      poll.votes = {};
    }

    // Record the vote
    poll.votes[username] = option;

    const totalMembers = targetGroup.members ? targetGroup.members.length : 0;
    const totalVotes = Object.keys(poll.votes).length;

    // If all members voted, mark as completed and tally
    if (totalVotes >= totalMembers) {
      poll.status = 'completed';

      const results = {};
      poll.options.forEach(opt => results[opt] = 0);

      Object.values(poll.votes).forEach(v => {
        results[v] = (results[v] || 0) + 1;
      });

      poll.results = results;
    } else {
      poll.status = 'pending';
    }

    await pollRef.update({
      votes: poll.votes,
      status: poll.status,
      results: poll.results || null
    });

    return res.status(200).json({
      message: 'Vote recorded',
      pollStatus: poll.status,
      votesCount: totalVotes,
      totalMembers
    });
  } catch (err) {
    console.error('Voting error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
