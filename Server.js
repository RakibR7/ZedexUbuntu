require('dotenv').config({ path: 'keys.env' });
const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const { Client, GatewayIntentBits } = require('discord.js');
const { exec } = require('child_process');
const glob = require('glob');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

client.login(process.env.DISCORD_TOKEN);

const chunksDir = path.join(__dirname, 'chunks');
const uploadsDir = path.join(__dirname, 'uploads');
const reassembledDir = path.join(__dirname, 'reassembled'); // Add reassembled directory

// Ensure directories exist
if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(reassembledDir)) {
    fs.mkdirSync(reassembledDir, { recursive: true }); // Ensure the reassembled directory exists
}

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp/')
}));
app.use(express.static('public'));

app.get('/test', (req, res) => res.send('Server is working'));

// Helper function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to send file chunks to Discord
async function sendFileChunkToDiscord(filePath) {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await channel.send({ files: [filePath] });
            console.log(`File chunk sent: ${filePath}`);
            //fs.unlinkSync(filePath); // Delete the chunk after sending
            await delay(1000); // Delay of 1 second between each chunk
            return;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} - Error sending file chunk to Discord: ${error}`);
            if (error.message.includes('rate limit')) {
                await delay(10000); // If rate limit error, wait longer
            } else {
                await delay(5000); // General retry delay
            }
        }
    }
    throw new Error(`Failed to send file chunk after multiple attempts: ${filePath}`);
}

// Endpoint to handle file uploads
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const file = req.files.file;
    const filePath = path.join(uploadsDir, file.name);
    console.log(`Uploading file to path: ${filePath}`);

    file.mv(filePath, async (err) => {
        if (err) {
            console.error(`Error saving file: ${err}`);
            return res.status(500).send(`Server error: ${err.message}`);
        }

        exec(`./chunk_and_encrypt.sh "${filePath}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                return res.status(500).send(`Server error: ${error.message}`);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).send(`Server error: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);

            const chunkPattern = path.join(chunksDir, `${file.name}_chunk*`);
            const chunkFiles = glob.sync(chunkPattern);

            console.log(`Found ${chunkFiles.length} chunks for file ${file.name}`);
            if (chunkFiles.length === 0) {
                console.error("No chunk files found. Check if chunking process is working.");
                return res.status(500).send('No chunk files created.');
            }

            for (const chunkFile of chunkFiles) {
                try {
                    await sendFileChunkToDiscord(chunkFile);
                } catch (error) {
                    console.error(`Error sending chunk to Discord: ${error.stack}`);
                    return res.status(500).send(`Failed to upload chunk: ${error.message}`);
                }
            }

            res.status(200).json({
                message: `File uploaded and chunks sent to Discord successfully!`,
            });
        });
    });
});

// Endpoint to handle file retrieval and reassembly
// Endpoint to handle file retrieval and reassembly
app.get('/retrieve', async (req, res) => {
    const fileName = req.query.fileName;
    if (!fileName) {
        return res.status(400).send('File name is required');
    }

    const reconstructedFilePath = path.join(reassembledDir, `${fileName}_reconstructed`);

    exec(`./decrypt_and_reassemble.sh "${fileName}" "${reconstructedFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return res.status(500).send(`Server error: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Server error: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);

        // Check if the file exists before attempting to send it
        if (fs.existsSync(reconstructedFilePath)) {
            res.download(reconstructedFilePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    // Do not attempt to send another response here, just log the error
                }

                // Clean up the file
                fs.unlink(reconstructedFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                    }
                });
            });
        } else {
            return res.status(404).send('File not found.');
        }
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
