// backend/FirebaseConfig.js
const admin = require('firebase-admin');
const path = require('path');

// Load .env FIRST (before Firebase)
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
module.exports = db;
