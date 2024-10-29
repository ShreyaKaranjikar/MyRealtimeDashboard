const express = require('express');
const router = express.Router();

// Example GET endpoint to test the data route
router.get('/', (req, res) => {
  res.send('Data route is working!');
});

module.exports = router;