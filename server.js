import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Filter image endpoint
app.get("/filteredimage", async (req, res) => {
  const imageUrl = req.query.image_url;

  if (!imageUrl) {
    return res.status(400).send("image_url query parameter is required");
  }

  try {
    const filteredPath = await filterImageFromURL(imageUrl);

    res.status(200).sendFile(filteredPath, (err) => {
      deleteLocalFiles([filteredPath]);

      if (err) {
        console.error(err);
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(422).send(
      "Unable to process image. Please provide a valid public image URL."
    );
  }
});

// Root Endpoint
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});