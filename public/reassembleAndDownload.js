document.getElementById('downloadBtn').addEventListener('click', async () => {
    const fileListElement = document.getElementById('fileNamesList');
    fileListElement.innerHTML = ''; // Clear existing list
    
    try {
        const response = await fetch('/files/metadata');
        const originalFileNames = await response.json();

        // Loop through each file name and create a list item and link
        originalFileNames.forEach(fileName => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            // Construct the href using the filename to initiate download
            // This URL pattern will need to match your server's endpoint for serving files
            link.href = `/download?filename=${encodeURIComponent(fileName)}`;
            link.textContent = fileName;
            // Optionally, set the download attribute to suggest a filename
            link.setAttribute('download', fileName);
            listItem.appendChild(link);
            fileListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching file metadata:', error);
    }
});


async function downloadFile(uniqueIdentifier, originalFileName) {
    try {
        const response = await fetch(`/reassemble-and-download?uniqueIdentifier=${uniqueIdentifier}`);
        if (!response.ok) throw new Error('Server responded with an error.');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = originalFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file.');
    }
}
