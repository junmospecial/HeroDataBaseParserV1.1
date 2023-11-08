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

// Search endpoint for powers
app.get('/api/search', (req, res) => {
  const { query, field, n } = req.query;

  // Reading superhero data
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    try {
      let superheroes = JSON.parse(data);

      // Load superhero powers if the 'power' field is queried
      if (field === 'power') {
        fs.readFile(powersFilePath, 'utf8', (err, powerData) => {
          if (err) {
            console.error('Error reading power file:', err);
            return res.status(500).json({ error: 'Error reading power file' });
          }

          const superheroPowers = JSON.parse(powerData);
          const matchingPowerHeroes = superheroPowers.filter((power) =>
            power[query] === 'True'
          );
          superheroes = superheroes.filter((hero) => {
            return matchingPowerHeroes.some((powerHero) =>
              powerHero.hero_names === hero.name
            );
          });

          if (superheroes.length === 0) {
            return res.status(404).json({ error: 'No matching superheroes found' });
          }
          
          superheroes = superheroes.map(hero => hero.id)
          if (n > 0) {
            superheroes = superheroes.slice(0, n)
          }

          res.json(superheroes);
        });
      } else {
        // Filtering based on other fields
        if (field && query) {
          superheroes = superheroes.filter(hero => {
            const value = hero[field] ? hero[field].toString().toLowerCase() : '';
            return value.includes(query.toLowerCase());
          });
        }

        if (superheroes.length === 0) {
          return res.status(404).json({ error: 'No matching superheroes found' });
        }
        superheroes = superheroes.map(hero => hero.id)
        if (n > 0) {
          superheroes = superheroes.slice(0, n)
        }
        res.json(superheroes);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

const superheroLists = {}; // This object will store lists of superhero IDs

// Create a new list with a given name

// Define the POST route to create a new superhero list
app.post('/api/favorite-lists', function (req, res) {
  const listName = req.body.listName;

  if (!listName || superheroLists[listName]) {
    res.status(400).send('Invalid list name or list name already exists.');
    return;
  }

  superheroLists[listName] = [];
  res.status(200).send('Superhero list created successfully.');
});

// Update an existing list with a given name using a PUT request
app.put('/api/favorite-lists/:listName', function (req, res) {
  const listName = req.params.listName;
  const superheroIds = req.body.superheroIds;

  if (!listName || listName.trim() === '') {
    res.status(400).send('Bad Request: List name is required.');
    return;
  }

  if (!superheroLists[listName]) {
    res.status(404).send(`Error 404: ${listName} does not exist.`);
    return;
  }

  // Append the new superhero IDs to the existing list of IDs
  superheroLists[listName] = [...superheroLists[listName], ...superheroIds];

  res.status(200).send(`Superhero list '${listName}' updated successfully.`);
});

// Get the superhero list with a given name
app.get('/api/favorite-lists/:listName', function (req, res) {
  const listName = req.params.listName;
  const superheroList = superheroLists[listName];

  if (superheroList) {
    res.json(superheroList);
  } else {
    res.status(404).send(`Superhero list '${listName}' not found.`);
  }
});

// Create an endpoint to get a list of names, information, and powers of superheroes saved in a given list
app.get('/api/favorite-lists/:listName/superheroes/info', (req, res) => {
  const listName = req.params.listName;

  // Check if the list exists
  if (!superheroLists[listName]) {
    return res.status(404).json({ error: 'List does not exist' });
  }

  // Read the superhero data file
  fs.readFile(filePath, 'utf8', (err, superheroesData) => {
    if (err) {
      console.error('Error reading superheroes data file:', err);
      return res.status(500).json({ error: 'Error reading superheroes data file' });
    }

    try {
      const superheroes = JSON.parse(superheroesData);
      // Filter superheroes that are in the list
      const superheroesInList = superheroes.filter(hero => superheroLists[listName].includes(hero.id));

      // Read the powers data file
      fs.readFile(powersFilePath, 'utf8', (err, powersData) => {
        if (err) {
          console.error('Error reading powers data file:', err);
          return res.status(500).json({ error: 'Error reading powers data file' });
        }

        const powers = JSON.parse(powersData);
        // Include powers for the superheroes
        const superheroesWithPowers = superheroesInList.map(hero => {
          const heroPowers = powers.find(power => power.hero_id === hero.id);
          return { ...hero, powers: heroPowers ? heroPowers.powers : [] };
        });

        res.json(superheroesWithPowers);
      });
    } catch (error) {
      console.error('Error parsing superheroes data:', error);
      res.status(500).json({ error: 'Error parsing superheroes data' });
    }
  });
});

// Get all superheroes
app.get('/api/superheroes', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }
    try {
      const superheroes = JSON.parse(data);
      res.json(superheroes);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});


app.delete('/api/favorite-lists/:name', (req, res) => {
  const listName = req.params.name;

  // Check if the list exists
  if (!superheroLists[listName]) {
    return res.status(404).send('List not found.');
  }

  // Delete the list
  delete superheroLists[listName];

  // Corrected line: Use template literals to include variables in the string
  res.send(`List ${listName} has been deleted.`);
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
