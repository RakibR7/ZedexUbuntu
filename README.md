Discord-Based File Storage System

Project Overview

This project was born out of the necessity to find an alternative to traditional cloud storage services, which, despite their convenience, often come at a financial cost once the free storage limit is reached. Leveraging the free storage capabilities provided by platforms like Discord, this system allows for the secure and cost-effective storage of files by splitting them into permissible sizes and managing their upload and retrieval through a custom-built interface.

Features

Discord Theme: A user interface styled after Discord, providing a familiar environment for Discord users.
File Management: Splits files into smaller chunks for storage and reassembles them upon retrieval, circumventing the file size limitations of Discord.
Data Encryption: Ensures privacy and security by encrypting files before upload and decrypting them after download.
Efficiency: Although not as fast as traditional cloud services, provides a reasonable upload and download speed given the cost-free nature of the storage.

Technical Implementation

The system utilizes a Node.js backend to handle the file processing, encryption, and interaction with the Discord API.
A React frontend offers a clean and simple interface for users to upload and download their files.
Discord's platform is used as the storage medium, with files stored as message attachments within a Discord server.

Authors

This innovative solution was developed by Emeka and Rakib, combining software engineering expertise with creative problem-solving to bypass the limitations of free storage on traditional cloud platforms.

Future Considerations

Following recent changes announced by Discord regarding external CDN links, the project's viability may be subject to further testing and possible adjustments to ensure continued functionality.


















ROAD TO SUCCESS ------------------------------------------------------------------------------------------------------------------------------------------------
(Windows)

I can guide you through the process of setting up a local server using Node.js to run your HTML file designed with a Discord theme. Here's a step-by-step guide:
Step 1: Install Node.js

If you haven't already installed Node.js, you'll need to do so. Node.js is a JavaScript runtime that lets you run JavaScript on the server side.

    Download Node.js: Go to the Node.js website and download the installer for your operating system.
    Install Node.js: Run the downloaded installer and follow the prompts to install Node.js and NPM (Node Package Manager).

Step 2: Create a New Node.js Project

    Create a Project Folder: Make a new folder on your computer where you want your project to live.
    Initialize the Project: Open a terminal or command prompt, navigate to your project folder, and run:

    bash

    npm init -y

    This command will create a package.json file in your project folder, which will keep track of your project dependencies.

Step 3: Install Express

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web applications.

    Install Express: In your project folder, run:

    bash

    npm install express

    This command will install Express and add it to your package.json file.

Step 4: Set Up Your Server

    Create a Server File: In your project folder, create a new file named server.js.
    Write Server Code: Open server.js in a text editor and add the following code:

    javascript

    const express = require('express');
    const app = express();
    const path = require('path');

    // Serve static files from the "public" directory
    app.use(express.static('public'));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '/public/discord_theme_upload.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

Step 5: Organize Your HTML File

    Create a Public Folder: Inside your project folder, create a new folder named public.
    Move Your HTML File: Move your Discord-themed HTML file (discord_theme_upload.html) into the public folder.

Step 6: Run Your Server

    Start the Server: In your terminal or command prompt, navigate to your project folder and run:

    bash

    node server.js

    Open in Browser: Open a web browser and go to http://localhost:3000. You should see your Discord-themed HTML page.

Step 7: Make Changes as Needed

    You can modify your HTML, CSS, and JavaScript files as needed. Just refresh your browser to see the changes.

