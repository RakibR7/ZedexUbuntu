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

client.login('MTE4MDk1ODUxNTU4MjQ4ODY1Ng.G9sHMz.7hH_H1Od_6xnS5lXNR2xtLGjUhykQZauj_kCxA');
//Emeka code MTE4MDU3MzkxMTQ0NDg4MTUzMA.GXiOOn.kusg2z10E_yJKCYNModN4ZxxQSvW_Ns2W8AKfw

const chunksDir = path.join(__dirname, 'chunks');
if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
}

app.use(fileUpload());
app.use(express.static('public'));

function saveChunksLocally(fileBuffer, chunkSize, originalFileName) {
    const chunkPaths = [];
    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
        const chunk = fileBuffer.slice(i, i + chunkSize);
        const chunkPath = path.join(chunksDir, `${originalFileName}-chunk-${i}.dat`);
        fs.writeFileSync(chunkPath, chunk);
        chunkPaths.push(chunkPath);
    }
    return chunkPaths;
}


// Function to send a file chunk to Discord
async function sendFileChunkToDiscord(filePath) {
    try {
        const channel = await client.channels.fetch('1181146332321284116'); //1181146332321284116 //Emeka: 1180586627547021315 //Server ID
        await channel.send({ files: [filePath] });
        console.log(`File chunk sent: ${filePath}`);
    } catch (error) {
        console.error(`Error sending file chunk to Discord: ${error}`);
        throw error; // Important to re-throw the error for proper error handling in Promise.all
    }
}




app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const file = req.files.file;
    const chunkSize = 8 * 1024 * 1024; // 8 MB chunks
    const chunkPaths = saveChunksLocally(file.data, chunkSize, file.name);

    // Send all chunks to Discord in parallel
    try {
        await Promise.all(chunkPaths.map(chunkPath => sendFileChunkToDiscord(chunkPath)));
        res.status(200).json({
            message: 'File uploaded and all chunks sent to Discord successfully!',
            chunkPaths: chunkPaths,
        });
    } catch (error) {
        res.status(500).send('An error occurred while sending file chunks to Discord.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
