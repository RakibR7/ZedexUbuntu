const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

fileInput.addEventListener('change', function() {
    if(fileInput.files.length > 0) {
        const file = fileInput.files[0];
        document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';
        document.getElementById('fileFormat').textContent = file.type || 'Unknown';
        document.getElementById('uploadDate').textContent = new Date().toLocaleDateString();
        document.getElementById('fileStats').style.display = 'block';
        fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.title');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    const buttons = document.querySelectorAll('.btn');

    title.classList.add('fade-in');

    fileUploadContainer.classList.add('slide-in-bottom');

    buttons.forEach((button, index) => {
        // Apply slide-in from bottom animation to buttons
        //setTimeout(() => button.classList.add('slide-in-bottom'), 300 + (index * 10)); // Reduced delay for faster animation
    });
});






async function uploadFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const chunkSize = 8 * 1024 * 1024; // 8 MB chunk size
        const totalChunks = Math.ceil(file.size / chunkSize);
        const progressBar = document.getElementById('progressBar');

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
            const formData = new FormData();
            formData.append('file', chunk, `${file.name}-chunk-${i}`);
            document.getElementById('chunksUploaded').textContent = i + 1;
            try {
                await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                // Update the progress bar
                const progress = Math.round((i + 1) / totalChunks * 100);
                progressBar.style.setProperty('--value', progress);
                progressBar.textContent = `${progress}%`;
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


function reassembleFile() {
    if (fileInput.files.length > 0) {
        showLoadingAnimation('reassemble'); // Show loading animation
        const file = fileInput.files[0];
        fetch(`/reassemble?fileName=${encodeURIComponent(file.name)}`)
            .then(response => response.text())
            .then(data => {
                alert('File reassembled successfully. Check server console/logs for details.');
                hideLoadingAnimation('reassemble'); // Hide loading animation
            })
            .catch(error => {
                console.error('Error reassembling the file:', error);
                alert('Error reassembling the file.');
                hideLoadingAnimation('reassemble'); // Hide loading animation
            });
    } else {
        alert('Please upload a file first.');
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

function showLoadingAnimation(context) {
    // Add context-specific logic for loading animation
    // Example: Change button text or add a loader to a specific area
}

function hideLoadingAnimation(context) {
    // Hide the loader and revert any changes made by showLoadingAnimation
}

// Create a new snowflake every 300 milliseconds
setInterval(createSnowflake, 300);

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; // Random animation duration
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = Math.random() * 20 + 10 + 'px';

    document.getElementById('snowflakes-container').appendChild(snowflake);

    // Remove the snowflake after it falls
    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}