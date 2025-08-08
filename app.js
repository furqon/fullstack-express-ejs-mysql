const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const blogRoutes = require('./routes/blog');

// Load environment variables
dotenv.config();

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Multer for image upload
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
app.use(multer({ storage }).single('image'));

// Start Server
const PORT = process.env.PORT || 3000;
app.use('/', blogRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});