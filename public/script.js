document.addEventListener('DOMContentLoaded', function() {
    // Ensure the function 'updateBackgroundWithAsciiArt' is defined or remove this call if not needed
    updateBackgroundWithAsciiArt();

    const title = document.querySelector('.title');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    const buttons = document.querySelectorAll('.btn');

    title.classList.add('fade-in');
    fileUploadContainer.classList.add('slide-in-bottom');
});

const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');

fileInput.addEventListener('change', function() {
    if (fileInput.files.length > 0) {
        updateFileStats(fileInput.files[0]); // Update file stats for the selected file
    }
});

function updateFileStats(file) {
    document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';
    document.getElementById('fileFormat').textContent = file.type || 'Unknown';
    document.getElementById('uploadDate').textContent = new Date().toLocaleDateString();
    document.getElementById('fileStats').style.display = 'block';
    fileNameDisplay.textContent = file.name;
}

async function reassembleFile() {
    // Assume the fileName is stored in a span with id="fileName"
    const fileNameElement = document.getElementById('fileName');
    const fileName = fileNameElement.textContent || fileNameElement.innerText;

    // Update the URL with your actual server information and port
    const url = `http://localhost:3000/retrieve?fileName=${encodeURIComponent(fileName)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        alert('File downloaded successfully.');
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file.');
    }
}



async function uploadFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            progressBar.value = 100; // Update progress bar to 100% on successful upload
            alert('File uploaded successfully.');
        } catch (error) {
            console.error(`Error uploading file:`, error);
            alert(`There was an error uploading the file`);
        }
    } else {
        alert('Please choose a file first.');
    }
}


// Add any additional functions or event listeners you need below
