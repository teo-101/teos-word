require("dotenv").config();

const express = require("express"); // Server
const cors = require("cors"); // Cross-Origin Resource Sharing to fetch from the backend to frontend.
const https = require("https");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8800; // Get port from dotenv

app.use(express.json());
app.use(cors());

// Serve static file from "public" dir
app.use(express.static(path.join(__dirname, "public")));

// Define route to serve "index.html"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Making an endpont for the api response
app.post('/api/getWords', (req, res) => {
  const { numberOfWords, length } = req.body;
  const url = `https://random-word-api.herokuapp.com/word?number=${numberOfWords}&length=${length}`;
  
  if (!numberOfWords || !length) {
    return res.status(400).json({message: "Invalid request data"});
  }

  https.get(url, (apiRes) => {
    let data = '';

    // Collect data from API
    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    // Handle end of response
    apiRes.on('end', () => {
      try {
        const words = JSON.parse(data);
        res.status(200).json({ words });
      } catch (error) { // If there is any problems with the external api response
        console.error("Error parsing json response from word API", error);
        res.status(500).json({ message: "Failed to parse response from word API" });
      }
    });
  }).on('error', (error) => {
    console.error("Error with API request word API", error);
    res.status(500).json({ message: "Internal server error word API"});
  });
});

app.get('/api/definition/:word', (req, res) => {
  const word = req.params.word;
  const url =`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  if (typeof word === 'string' && word != null) {
    https.get(url, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const definition = JSON.parse(data);
          res.status(200).json({ definition });
        } catch (error) {
          console.error("Error parsing json response from definiton API", error);
          res.status(500).json({ message: "Failed to parse response from definiton API" });
        }
      }).on('error', (error) => {
        console.error("Error with def API request", error);
        res.status(500).json({ message: "Internal server error def API"});
      });
    });
  }
  else {
    return res.status(400).json({message: "Invalid request data"});
  }
});

const mongoose = require('./db');
const pastWords = require('./models/PastWords');

app.post('/pastWords', async (req,res) => {
  try {
    const dbWord = new pastWords(req.body); // New past Word instance
    await dbWord.save(); // Save the user to the db
    res.status(201).send(dbWord);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/pastWords', async (req, res) => {
  try {
    const pastWordsDb = await pastWords.find(); // All past words
    res.status(200).send(pastWordsDb);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/lastEntry', async (req, res) => {
  try {
    const latestEntry = await pastWords.findOne().sort({ date: -1 });
    if (!latestEntry) {
      return res.status(404).json({ message: "No entries found in the database" });
    }
    res.status(200).json(latestEntry);
  } catch (error) {
    console.error("Error fetching latest entry from the database:", error);
    res.status(500).json({ message: "Server error fetching latest entry" });
  }
});


app.post('/updateDatabase', async (req, res) => {
  try {
    // Fetch a random word from the API
    const url = 'https://random-word-api.herokuapp.com/word?number=1&length=5';
    
    https.get(url, (apiRes) => {
      let data = '';

      // Collect data from the API response
      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      // Handle the end of the API response
      apiRes.on('end', async () => {
        try {
          const [randomWord] = JSON.parse(data); // Get the single word returned in an array
          
          // Create a new database entry with the word
          const dailyWord = new pastWords({ word: randomWord });
          await dailyWord.save();

          // Respond with the saved word
          res.status(201).send(dailyWord);
        } catch (error) {
          console.error("Error parsing json response from word API", error);
          res.status(500).json({ message: "Failed to parse response from word API" });
        }
      });
      
    }).on('error', (error) => {
      console.error("Error with API request", error);
      res.status(500).json({ message: "Error fetching random word" });
    });

  } catch (error) {
    console.error("Error saving daily word:", error);
    res.status(400).send(error);
  }
});
