const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000;
const csvFilePath = path.join(__dirname, 'data', 'data.csv');

app.use(cors()); 

app.get('/api/inventory', (req, res) => {
  const { brand, duration } = req.query;
  const results = [];
  const now = new Date();

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      let include = true;

      if (brand) {
        include = row.brand.toLowerCase() === brand.toLowerCase();
      }

      if (include && duration) {
        const timestamp = new Date(row.timestamp);
        const differenceInDays =
          (now - timestamp) / (1000 * 60 * 60 * 24);
        include = differenceInDays <= parseInt(duration, 10);
      }

      if (include) {
        results.push(row);
      }
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}/api/inventory`);
});
