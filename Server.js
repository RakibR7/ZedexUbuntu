const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;

// Ensure the chunks directory exists
const chunksDir = path.join(__dirname, 'chunks');
if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
}

app.use(fileUpload());
app.use(express.static('public'));

// Function to split a file into chunks and save locally
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

// Function to reassemble chunks
function reassembleFile(originalFileName) {
    const reassembledFilePath = path.join(chunksDir, `reassembled-${originalFileName}`);
    const writeStream = fs.createWriteStream(reassembledFilePath);

    fs.readdirSync(chunksDir).filter(fileName => fileName.includes(originalFileName)).sort().forEach(fileName => {
        const chunkPath = path.join(chunksDir, fileName);
        const chunkContent = fs.readFileSync(chunkPath);
        writeStream.write(chunkContent);
    });

    writeStream.end();
    return reassembledFilePath;
}

// Endpoint to handle file uploads
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const file = req.files.file;
    const chunkSize = 8 * 1024 * 1024; // 8 MB chunks, adjust if needed
    const chunkPaths = saveChunksLocally(file.data, chunkSize, file.name);

    res.status(200).json({
        message: 'File uploaded and chunked successfully!',
        chunkPaths: chunkPaths,
    });
});

// Endpoint to trigger reassembly
app.get('/reassemble', (req, res) => {
    const originalFileName = req.query.fileName; // Pass the original file name as a query parameter

    if (!originalFileName) {
        return res.status(400).send('File name is required');
    }

    try {
        const filePath = reassembleFile(originalFileName);
        res.status(200).send(`File reassembled successfully: ${filePath}`);
    } catch (error) {
        res.status(500).send('Error reassembling the file.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
