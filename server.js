require("dotenv").config();

const express = require("express"); // Server
const mongoose = require("mongoose"); // Future connection to mongoDB
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