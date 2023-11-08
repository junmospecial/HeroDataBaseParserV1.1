const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3000;


// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Load superhero powers into memory (assuming they are not huge in size for this example)
const powersFilePath = path.join(__dirname, '..', 'data', 'superhero_powers.json');
const filePath = path.join(__dirname, '..', 'data', 'superhero_info.json');
const superheroPowers = JSON.parse(fs.readFileSync(powersFilePath, 'utf8'));



// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
