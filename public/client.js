function updateBackgroundWithAsciiArt() {
    fetch('/random-ascii')
        .then(response => response.text())
        .then(asciiArt => {
            const asciiContainer = document.getElementById('ascii-art-container');
            asciiContainer.textContent = asciiArt;
        })
        .catch(error => console.error('Error fetching ASCII art:', error));
}

updateBackgroundWithAsciiArt();
