const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET items with query filtering (search by query params)
router.get('/search', async (req, res) => {
  try {
    const { name, minPrice, maxPrice } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const items = await Item.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// POST search using request body
router.post('/search', async (req, res) => {
  try {
    const query = req.body;
    const items = await Item.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new item  '/' -> route path of current router;
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
