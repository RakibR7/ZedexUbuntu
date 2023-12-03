require('dotenv').config({ path: 'keys.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = 3000;

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
    const chunkSize = 7 * 1024 * 1024; // Slightly reduced chunk size
    const chunkPaths = saveChunksLocally(file.data, chunkSize, file.name);

    for (const chunkPath of chunkPaths) {
        try {
            await sendFileChunkToDiscord(chunkPath);
            await delay(10000); // Delay between each chunk
        } catch (error) {
            console.error(`Detailed error: ${error.stack}`); // Enhanced error logging
            return res.status(500).send(`Failed to upload file: ${error.message}`);
        }
    }

    res.status(200).json({
        message: `File uploaded and sent to Discord successfully!`,
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
