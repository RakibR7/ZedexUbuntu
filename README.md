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










ROAD TO SUCCESS ---------------------------------


Creating a website that allows users to upload files to Discord, bypasses the file size limit by splitting the files into chunks, and wraps them in a virtual file system involves several steps and components. You mentioned you have a server in NodeJS and a frontend in React. Below is a step-by-step guide to set up such a system:
1. Setting Up the Backend (Node.js)

1.1. Initialize Node.js Project

    Create a new directory for your project.
    Initialize a Node.js project using npm init.
    Install necessary packages like express for the server, discord.js for Discord interaction, and multer for handling file uploads.

1.2. Implement File Chunking

    Write a function to split large files into smaller chunks. Each chunk should be within Discord's file size limit.
    Ensure that each chunk is labeled to reconstruct the original file later.

1.3. Discord Bot Setup

    Create a Discord bot via the Discord Developer Portal.
    Add the bot to your server and save the bot token.
    Use discord.js to authenticate your bot in your Node.js application.

1.4. File Upload Endpoint

    Create an endpoint in your Express server to handle file uploads.
    Use multer to receive the file and then process it into chunks.
    Implement logic to upload each chunk to a Discord channel using your bot. Store metadata to track these chunks.

1.5. Virtual File System

    Implement a system to manage the metadata of files and their chunks, possibly using a database.
    This system should track which chunks belong to which file and how to reassemble them.

2. Setting Up the Frontend (React)

2.1. Initialize React Project

    Create a new React project using Create React App.
    Install necessary packages like axios for making HTTP requests.

2.2. File Upload Interface

    Create a user interface for file uploads. This should include a form for file selection.
    Implement functionality to send the selected file to your backend server for processing and upload to Discord.

2.3. File Retrieval Interface

    Provide an interface to view and download the files stored on Discord.
    Implement functionality to request the backend for file reconstruction from chunks and initiate a download.

3. Running the Application

3.1. Start the Backend Server

    Run your Node.js server.

3.2. Start the React Application

    Start your React application so that it's accessible from a browser.

3.3. Testing

    Perform thorough testing to ensure files are uploading, chunking, storing, and downloading correctly.

4. Deployment

4.1. Deploy the Backend

    Choose a cloud service provider (like Heroku, AWS, etc.).
    Deploy your Node.js application to the cloud.

4.2. Deploy the Frontend

    Deploy your React application. This can be done on platforms like Netlify or Vercel.

4.3. Environment Variables and Security

    Ensure that sensitive information like Discord tokens is stored in environment variables and not exposed.

5. Monitoring and Maintenance

    Regularly monitor your application for any issues or bugs.
    Keep your Node.js and React applications updated with the latest packages.

Notes

    Be aware of Discord's Terms of Service. Using Discord as a cloud storage service might violate these terms.
    Ensure you have error handling for network issues, file corruption, and Discord API limits.
    Consider adding encryption for the files for additional security.

This is a high-level overview. Each step will require detailed coding and thorough testing to ensure functionality and reliability.

