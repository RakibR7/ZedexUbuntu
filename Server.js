require('dotenv').config({ path: 'keys.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { Client, GatewayIntentBits } = require('discord.js');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Define the path for the metadata directory
const metadataDir = path.join(__dirname, 'metadata');

// Ensure that the chunks and metadata directories exist
if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
}

// Define the path to the "public" directory
const publicDirectory = path.join(__dirname, 'ascii-art');

// Define a route to serve random ASCII art
app.get('/random-ascii', (req, res) => {
  // Read the list of ASCII art files in the "public" directory
  fs.readdir(publicDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Internal server error');
    }

    // Filter out non-text files (e.g., directories)
    const textFiles = files.filter(file => file.endsWith('.txt'));

    // Generate a random index to select a random ASCII art file
    const randomIndex = Math.floor(Math.random() * textFiles.length);
    const randomAsciiFile = textFiles[randomIndex];
    const asciiFilePath = path.join(publicDirectory, randomAsciiFile);

    // Read and send the content of the random ASCII art file as the response
    fs.readFile(asciiFilePath, 'utf8', (err, asciiArt) => {
      if (err) {
        console.error('Error reading ASCII art file:', err);
        return res.status(500).send('Internal server error');
      }
      
      // Send the random ASCII art as a response
      res.send(asciiArt);
    });
  });
});


// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Use Discord token from environment variables for security
client.login(process.env.DISCORD_TOKEN);

// Define the path for the chunks directory
const chunksDir = path.join(__dirname, 'chunks');

// Ensure that the chunks directory exists
if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
}

app.use(fileUpload());
app.use(express.static('public'));

app.get('/test', (req, res) => res.send('Server is working'));

function saveChunksLocally(fileBuffer, chunkSize, originalFileName) {
    const chunkPaths = [];
    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
        const end = Math.min(i + chunkSize, fileBuffer.length);
        const chunk = fileBuffer.slice(i, end);
        const chunkPath = path.join(chunksDir, `${originalFileName}-chunk-${i}`);
        fs.writeFileSync(chunkPath, chunk);
        chunkPaths.push(chunkPath);
    }
    return chunkPaths;
}

async function sendFileChunkToDiscord(filePath) {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    let attempt = 0;
    while (attempt < 3) {
        try {
            await channel.send({ files: [filePath] });
            console.log(`File chunk sent: ${filePath}`);
            fs.unlinkSync(filePath); // Consider the file chunk handled, delete it
            break; // Exit the loop if successful
        } catch (error) {
            console.error(`Attempt ${attempt + 1} - Error sending file chunk to Discord: ${error}`);
            attempt++;
            if (attempt < 3) await delay(5000); // Wait for 5 seconds before retrying, if there are attempts left
        }
    }

    if (attempt === 3) {
        throw new Error(`Failed to send file chunk after multiple attempts: ${filePath}`);
    }
}

// Define the delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// Helper function to generate a 6 character unique identifier
function generateShortHash(input) {
    return crypto.createHash('md5').update(input).digest('hex').substring(0, 6);
}

// Route to handle file uploads
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const file = req.files.file;
    const chunkIndex = req.headers['chunk-index'];
    const uniqueIdentifier = req.headers['unique-identifier'];

    // Validate the presence of the chunk index and unique identifier
    if (!chunkIndex || !uniqueIdentifier) {
        return res.status(400).send('Chunk index or unique identifier not provided.');
    }

    // Construct the chunk's filename using the unique identifier and chunk index
    const chunkFilename = `${uniqueIdentifier}-chunk-${chunkIndex}`;
    const chunkPath = path.join(chunksDir, chunkFilename);

    // Save the chunk to the filesystem
    try {
        fs.writeFileSync(chunkPath, file.data);
        console.log(`Saved chunk ${chunkIndex} with identifier ${uniqueIdentifier} at path ${chunkPath}.`);

        // Send the file chunk to Discord
        await sendFileChunkToDiscord(chunkPath);
        console.log(`Chunk ${chunkIndex} sent to Discord.`);

        // Update the metadata file for this upload
        const metadataPath = path.join(metadataDir, `${uniqueIdentifier}.json`);
        let metadata;
        
        // If metadata file exists, read it, otherwise create a new metadata object
        if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            metadata.chunks.push(chunkPath);
        } else {
            metadata = {
                originalFileName: file.name,
                chunks: [chunkPath],
                totalChunks: null, // You need to send this information from the client or calculate it on the server
                uniqueIdentifier: uniqueIdentifier,
            };
        }
        
        // Write the updated metadata back to the filesystem
        fs.writeFileSync(metadataPath, JSON.stringify(metadata));
        
        res.status(200).json({
            message: `Chunk ${chunkIndex} for file ${file.name} with identifier ${uniqueIdentifier} uploaded successfully.`
        });
    } catch (error) {
        console.error(`Error saving chunk ${chunkIndex} with identifier ${uniqueIdentifier}: ${error}`);
        res.status(500).send('Server error: Failed to upload chunk.');
    }
});





// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
