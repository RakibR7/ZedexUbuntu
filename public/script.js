const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

fileInput.addEventListener('change', function() {
    fileNameDisplay.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
});

async function uploadFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const chunkSize = 8 * 1024 * 1024; // 8 MB chunk size
        const totalChunks = Math.ceil(file.size / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
            const formData = new FormData();
            formData.append('file', chunk, `${file.name}-chunk-${i}`);

            try {
                await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                console.log(`Chunk ${i + 1}/${totalChunks} uploaded`);
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
        const file = fileInput.files[0];
        fetch(`/reassemble?fileName=${encodeURIComponent(file.name)}`)
            .then(response => response.text())
            .then(data => {
                alert('File reassembled successfully. Check server console/logs for details.');
            })
            .catch(error => {
                console.error('Error reassembling the file:', error);
                alert('Error reassembling the file.');
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

function showLoadingAnimation(scriptType) {
    const button = scriptType === 'bash' ? document.querySelector('button[onclick="runBashScript()"]') : document.querySelector('button[onclick="runZshScript()"]');
    button.innerHTML = '<div class="loader"></div>';
}

function hideLoadingAnimation(scriptType) {
    const buttonText = scriptType === 'bash' ? 'Check integrity' : 'Clean Chunks';
    const button = scriptType === 'bash' ? document.querySelector('button[onclick="runBashScript()"]') : document.querySelector('button[onclick="runZshScript()"]');
    button.textContent = buttonText;
}
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

// Create a new snowflake every 300 milliseconds
setInterval(createSnowflake, 300);

    // Function to add multiple snowflakes
    function addSnowflakes(containerClass, snowflakeClass, count) {
    const container = document.querySelector(containerClass);
    for (let i = 0; i < count; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = snowflakeClass;
    container.appendChild(snowflake);
}
}

    // Add snowflakes after the page has loaded
    window.onload = function() {
    addSnowflakes('.small-snow', 'small', 20);
    addSnowflakes('.medium-snow', 'medium', 20);
    // Add other elements like trees and tree parts as needed
};

