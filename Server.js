require('dotenv').config({ path: 'keys.env' });

const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { Client, GatewayIntentBits } = require('discord.js');
const crypto = require('crypto');
//const { reassembleFile } = require('./fileReassembly'); // Assume this is a module you create
//const database = require('./database'); // Assume this is a module for interacting with your database


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

// Middleware to parse JSON bodies
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
        // Remove the chunk number and hash from the file name
        // Remove everything after the first hyphen following the extension
        const originalFileName = file.name.replace(/(\.[^.-]+)-.*/, '$1');
        metadata = {
            originalFileName: originalFileName,
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


//const { Client, Intents } = require('discord.js');
//const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.login('MTE4MDk1ODUxNTU4MjQ4ODY1Ng.G9sHMz.7hH_H1Od_6xnS5lXNR2xtLGjUhykQZauj_kCxA');

app.get('/files', async (req, res) => {
    const channel = await client.channels.fetch('1181146332321284116');
    const messages = await channel.messages.fetch({ limit: 100 }); // Adjust limit as needed
    const files = messages.map(message => 
        message.attachments.map(attachment => ({
            url: attachment.url,
            name: attachment.name,
            // Add any other relevant info you need
        }))
    ).flat();

    res.json(files);
});


// Endpoint to get list of completed uploads
app.get('/completed-uploads', async (req, res) => {
    const completedFiles = await database.getCompletedFiles();
    res.json(completedFiles);
});

// Endpoint to reassemble and download a file
app.get('/reassemble-and-download', async (req, res) => {
    const { uniqueIdentifier } = req.query;
    if (!uniqueIdentifier) {
        return res.status(400).send('Unique identifier is required.');
    }

    try {
        const reassembledFilePath = await reassembleFile(uniqueIdentifier); // Implement this function
        res.download(reassembledFilePath);
    } catch (error) {
        console.error('Error reassembling file:', error);
        res.status(500).send('Error reassembling file.');
    }
});


// Function to reassemble the file
async function reassembleFile(uniqueIdentifier, chunkDir) {
    // Read the metadata JSON to get the order of chunks
    const metadataPath = path.join(chunkDir, `${uniqueIdentifier}.json`);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Sort the chunks based on the chunk number extracted from the filename
    const sortedChunks = metadata.chunks.sort((a, b) => {
        const numA = parseInt(a.match(/chunk-(\d+)/)[1], 10);
        const numB = parseInt(b.match(/chunk-(\d+)/)[1], 10);
        return numA - numB;
    });

    // Define the path for the reassembled file
    const outputFile = path.join(__dirname, 'output', `${metadata.originalFileName}`);

    // Create a writable stream for the outputFile
    const writeStream = fs.createWriteStream(outputFile);

    // Use a promise to handle the async nature of streams
    await new Promise((resolve, reject) => {
        sortedChunks.forEach(chunkPath => {
            const chunkContent = fs.readFileSync(chunkPath);
            writeStream.write(chunkContent);
            fs.unlinkSync(chunkPath); // Optionally, delete the chunk after it has been used
        });

        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        writeStream.end();
    });

    return outputFile; // Return the path to the reassembled file
}

app.get('/download', async (req, res) => {
    const filename = req.query.filename;
    // Assuming you have a function that takes a filename and fetches the chunks from Discord
    try {
        const chunks = await fetchChunksFromDiscord(filename);
        const reassembledFilePath = await reassembleFile(chunks, filename);
        res.download(reassembledFilePath, filename, (err) => {
            if (err) {
                // Handle error
                console.error(err);
                res.status(500).send('Error downloading file.');
            }
            // Optionally delete the reassembled file if you don't want to keep it on the server
            // fs.unlinkSync(reassembledFilePath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your download.');
    }
});

  
  



// Endpoint to retrieve metadata for all files
app.get('/files/metadata', async (req, res) => {
    // Read the metadata directory
    fs.readdir(metadataDir, (err, files) => {
        if (err) {
            console.error('Error reading metadata directory:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Filter for JSON files only
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        const originalFileNames = [];

        for (const file of jsonFiles) {
            // Read each metadata JSON file
            const metadata = JSON.parse(fs.readFileSync(path.join(metadataDir, file), 'utf-8'));
            // Assuming each JSON file contains a 'originalFileName' field
            originalFileNames.push(metadata.originalFileName);
        }

        // Send the list of original file names as a response
        res.json(originalFileNames);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
