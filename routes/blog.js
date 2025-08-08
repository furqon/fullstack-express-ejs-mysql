const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Blog List with Search and Pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const searchQuery = `%${search}%`;
  
  try {
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as count FROM blogs WHERE title LIKE ? OR content LIKE ?',
      [searchQuery, searchQuery]
    );
    const totalPages = Math.ceil(countRows[0].count / limit);
    
    const [rows] = await pool.query(
      'SELECT * FROM blogs WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [searchQuery, searchQuery, limit, offset]
    );
    
    res.render('index', { blogs: rows, page, totalPages, search });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Card-based Blog List
router.get('/cards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.render('cards', { blogs: rows });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Blog Form
router.get('/add', (req, res) => {
  res.render('form', { blog: null });
});

// Edit Blog Form
router.get('/edit/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).send('Blog not found');
    res.render('form', { blog: rows[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create Blog
router.post('/add', async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    await pool.query(
      'INSERT INTO blogs (title, content, image) VALUES (?, ?, ?)',
      [title, content, image]
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update Blog
router.post('/edit/:id', async (req, res) => {
  const { title, content, existingImage } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : existingImage;
  
  try {
    await pool.query(
      'UPDATE blogs SET title = ?, content = ?, image = ? WHERE id = ?',
      [title, content, image, req.params.id]
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete Blog
router.post('/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;