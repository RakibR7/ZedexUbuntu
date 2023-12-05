const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');

document.addEventListener('DOMContentLoaded', function() {
    updateBackgroundWithAsciiArt();
    const title = document.querySelector('.title');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    const buttons = document.querySelectorAll('.btn');
    

    title.classList.add('fade-in');
    fileUploadContainer.classList.add('slide-in-bottom');
});

fileInput.addEventListener('change', function() {
    if(fileInput.files.length > 0) {
        const file = fileInput.files[0];
        // Convert the file size to MB and update the text content
        document.getElementById('fileSize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        document.getElementById('fileFormat').textContent = file.type || 'Unknown';
        document.getElementById('uploadDate').textContent = new Date().toLocaleDateString();
        document.getElementById('fileStats').style.display = 'block';
        fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
        updateFileStats(file); // Function to update file stats
    } 
});


// A simple hash function to generate a short unique identifier
function generateShortHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 6); // Take first 6 hex digits
}


async function uploadFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const chunkSize = 8 * 1024 * 1024; // 8 MB chunk size
        const totalChunks = Math.ceil(file.size / chunkSize);
        const progressBar = document.getElementById('progressBar');
        const currentChunkDisplay = document.getElementById('currentChunkStatus'); // Ensure this element exists in your HTML
        // Use a shorter unique identifier
        const uniqueIdentifier = generateShortHash(file.name + Date.now());

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
            const formData = new FormData();
            // Correct the chunk name to include the unique identifier and the chunk index
            const chunkName = `${file.name}-${uniqueIdentifier}-chunk-${i}`;
            formData.append('file', chunk, chunkName);
            currentChunkDisplay.textContent = `Uploading chunk ${i + 1} of ${totalChunks}`;

            try {
                await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Chunk-Index': i.toString(),
                        'Unique-Identifier': uniqueIdentifier.toString() // Send the unique identifier in the headers
                    }
                });
                const progress = Math.round((i + 1) / totalChunks * 100);
                progressBar.value = progress;
            } catch (error) {
                console.error(`Error uploading chunk ${i + 1}:`, error);
                alert(`There was an error uploading chunk ${i + 1}`);
                return;
            }
        }
        alert('All chunks uploaded successfully.');
    } else {
        alert('Please choose a file first.');
    }
}





function updateFileStats(file) {
    // Function to update file statistics like size, format, etc.
    document.getElementById('fileSize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('fileFormat').textContent = file.type || 'Unknown';
    document.getElementById('uploadDate').textContent = new Date().toLocaleDateString();
    document.getElementById('fileStats').style.display = 'block';
    fileNameDisplay.textContent = file.name;
}

async function reassembleFile(uniqueIdentifier, originalFileName, chunkDir) {
    const outputFile = path.join(__dirname, 'output', originalFileName);
    const writeStream = fs.createWriteStream(outputFile);

    try {
        // Read directory and filter out relevant chunks
        const files = fs.readdirSync(chunkDir);
        const relevantChunks = files.filter(file => file.startsWith(uniqueIdentifier))
                                    .sort(/* sorting logic based on your naming convention */);

        for (const chunkName of relevantChunks) {
            const chunkPath = path.join(chunkDir, chunkName);
            const chunkContent = fs.readFileSync(chunkPath);
            writeStream.write(chunkContent);
            fs.unlinkSync(chunkPath); // Optionally, delete the chunk after it has been used
        }

        writeStream.end();
        return outputFile;
    } catch (error) {
        console.error('Error in reassembling file:', error);
        throw error; // rethrow the error for further handling
    }
}



function runBashScript() {
    showLoadingAnimation('bash');
    fetch('/run-bash-script')
        .then(response => response.text())
        .then(data => {
            hideLoadingAnimation('bash');
            alert('Bash script executed. Check server console/logs for details.');
        })
        .catch(error => {
            hideLoadingAnimation('bash');
            console.error('Error running Bash script:', error);
        });
}

function runZshScript() {
    showLoadingAnimation('zsh');
    fetch('/run-zsh-script')
        .then(response => response.text())
        .then(data => {
            hideLoadingAnimation('zsh');
            alert('Zsh script executed. Check server console/logs for details.');
        })
        .catch(error => {
            hideLoadingAnimation('zsh');
            console.error('Error running Zsh script:', error);
        });
}



// Create a new snowflake every 300 milliseconds
setInterval(createSnowflake, 300);

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';

    // Set initial position and randomize horizontal position
    snowflake.style.top = '-30px'; // Start off-screen
    snowflake.style.left = Math.random() * 100 + '%';

    // Randomize size and opacity
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = Math.random() * 20 + 10 + 'px';

    // Add the snowflake to the container
    document.getElementById('snowflakes-container').appendChild(snowflake);

    // Animation: Move to bottom
    let screenHeight = window.innerHeight;
    snowflake.animate([
        { transform: `translateY(0px)` },
        { transform: `translateY(${screenHeight}px)` }
    ], {
        duration: Math.random() * 3000 + 2000, // Random duration between 2 to 5 seconds
        easing: 'linear'
        });

    // Remove the snowflake after it falls
    setTimeout(() => {
        snowflake.remove();
    }, 5000);    
}
