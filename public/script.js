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
    fetch('/run-bash-script')
        .then(response => response.text())
        .then(data => alert('Bash script executed. Check server console/logs for details.'))
        .catch(error => console.error('Error running Bash script:', error));
}

function runZshScript() {
    fetch('/run-zsh-script')
        .then(response => response.text())
        .then(data => alert('Zsh script executed. Check server console/logs for details.'))
        .catch(error => console.error('Error running Zsh script:', error));
}
