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
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                console.log(`Chunk ${i + 1}/${totalChunks} uploaded`, data);
            } catch (error) {
                console.error(`Error uploading chunk ${i + 1}`, error);
                alert(`There was an error uploading chunk ${i + 1}`);
                return;
            }
        }

        alert('All chunks uploaded successfully.');
    } else {
        alert('Please choose a file first.');
    }
}
