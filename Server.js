require('dotenv').config({ path: 'keys.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = 3000;

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

const chunksDir = path.join(__dirname, 'chunks');
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
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await channel.send({ files: [filePath] });
            console.log(`File chunk sent: ${filePath}`);
            fs.unlinkSync(filePath);
            return;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} - Error sending file chunk to Discord: ${error}`);
            await delay(5000); // Wait for 5 seconds before retrying
        }
    }
    throw new Error(`Failed to send file chunk after multiple attempts: ${filePath}`);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const file = req.files.file;
    const chunkIndex = req.headers['chunk-index']; // Get the current chunk index
    console.log(`Receiving chunk ${chunkIndex} of file ${file.name}`);

    const chunkPath = path.join(chunksDir, `${file.name}-chunk-${chunkIndex}`);
    fs.writeFileSync(chunkPath, file.data);

    try {
        await sendFileChunkToDiscord(chunkPath);
        await delay(10000); // Delay between each chunk
    } catch (error) {
        console.error(`Error sending chunk ${chunkIndex} to Discord: ${error.stack}`);
        return res.status(500).send(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
    }

    res.status(200).json({
        message: `Chunk ${chunkIndex} uploaded and sent to Discord successfully!`,
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
