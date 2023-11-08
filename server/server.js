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


// Get superhero info by ID
app.get('/api/superheroes/:id', (req, res) => {
  const { id } = req.params;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    const superheroes = JSON.parse(data);
    const superhero = superheroes.find(sh => sh.id === parseInt(id));
    if (!superhero) return res.status(404).send('Superhero not found');
    res.json(superhero);
  });
});

// Get powers for a given superhero ID
app.get("/api/superheroes/:id/powers", (req, res) => {
  const superheroId = req.params.id;

  fs.readFile(filePath, "utf8", (err, superheroesData) => {
    if (err) {
      console.error("Error reading superheroes file:", err);
      return res.status(500).json({ error: "Error reading superheroes file" });
    }

    try {
      const superheroes = JSON.parse(superheroesData);
      // Find the superhero with the given ID
      const superhero = superheroes.find(
        (sh) => sh.id.toString() === superheroId
      );
      if (!superhero) {
        return res.status(404).json({ error: "Superhero not found" });
      }

      fs.readFile(powersFilePath, "utf8", (err, powersData) => {
        if (err) {
          console.error("Error reading powers file:", err);
          return res.status(500).json({ error: "Error reading powers file" });
        }

        try {
  
          const powers = JSON.parse(powersData);
          const superheroPowers = powers.find(
            (power) =>  power.hero_names=== superhero.name
            );
          if (!superheroPowers) {
            return res.status(404).json({ error: 'Superhero not found' });
          }
        
          const truePowers = Object.keys(superheroPowers).filter(powerName => superheroPowers[powerName] === 'True');

          res.json(truePowers);
        } catch (error) {
          console.error("Error parsing powers JSON:", error);
          res.status(500).json({ error: "Error parsing powers JSON" });
        }
      });
    } catch (error) {
      console.error("Error parsing superheroes JSON:", error);
      res.status(500).json({ error: "Error parsing superheroes JSON" });
    }
  });
});


// Get all available publisher names
app.get('/api/publishers', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'superhero_info.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    const superheroes = JSON.parse(data);

    // Use 'Publisher' with a capital 'P' to match your JSON data structure
    const publishers = [...new Set(superheroes.map(sh => sh.Publisher))]; // Adjust the field name as necessary

    // Check for null or undefined publishers
    const validPublishers = publishers.filter(publisher => publisher);
    if (!validPublishers.length) {
      return res.status(404).json({ error: 'No publishers found' });
    }
    res.json(validPublishers);
  });
});


// Define a field mapping object
const fieldMap = {
  'name': 'name', // assuming 'name' in the JSON is all lowercase
  'race': 'Race',
  'publisher': 'Publisher',
  // add other fields as necessary
};



// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
