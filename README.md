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


















ROAD TO SUCCESS -----------------------------------------------------------------------------------------------------------------------

Chunk Naming Convention:
The code shows that when files are uploaded in chunks, they are named using a unique identifier and a chunk index (e.g., 3f99cf-chunk-0).

Downloading Chunks:
The server-side code includes an endpoint at /download-chunks which, when given a uniqueIdentifier, will fetch related file chunks from Discord using the function fetchChunksFromDiscord(uniqueIdentifier) and save them locally using saveChunksToLocal(files, uniqueIdentifier, downloadedChunksDir).

Reassembling the File:
The function reassembleFile(uniqueIdentifier, outputDir) is designed to look for chunks in a directory, sort them according to their chunk index, and then reassemble them into a single file. It matches chunks using the uniqueIdentifier which is consistent with the file naming in your image.

File Upload to Discord:
The code contains functionality to upload files to Discord through the sendFileChunkToDiscord(filePath) function. It sends chunks to a specific Discord channel, and if the upload fails, it retries up to three times.

Environment Configuration:
The server utilizes environment variables (stored in a .env file) for sensitive information like the Discord token and channel ID, which is a best practice for security.

Middleware and Static Files:
It uses fileUpload() middleware for handling file uploads and serves static files from a public directory.
Routes for File Handling:

Several routes are defined for different aspects of file handling, such as /upload for uploading chunks, /files for listing files associated with a unique identifier, /reassemble-and-download for reassembling and downloading the reassembled file, and /files/metadata for retrieving metadata of files.

Error Handling and Logging:
The code contains error handling for various operations and logs messages to the console to track the process flow and any issues that arise.
































Method of reasembly:

The method I used to reassemble the file chunks into a single file is based on a straightforward binary concatenation approach. Here's a breakdown of the process:

Identifying Chunk Order: The order of the chunks was determined based on their naming or the sequence provided in the JSON file. It's crucial to concatenate the chunks in the correct order to maintain data integrity.

Binary Concatenation: Each chunk was opened in binary read mode ('rb'), and the contents were sequentially written to a new file, also in binary mode ('wb'). This method treats the data as a sequence of bytes, which is essential for maintaining the integrity of non-text data.

Writing to a New File: The contents of each chunk were copied into a new file. This file was also opened in binary write mode to ensure that all types of data (text, images, audio, etc.) could be correctly written without any data corruption or format issues.

This method is universally applicable to all file types, including videos, music, documents, images, and more. The reason is that it doesn't interpret the content of the files; it simply treats them as a sequence of bytes. This is particularly important for binary files (like videos and music) where any alteration or misinterpretation of the bytes can corrupt the file.

For this method to work effectively with files like videos or music, the following conditions must be met:

Correct Order of Chunks: The chunks must be concatenated in the correct order. This is vital for any file type but especially for complex formats like videos, where data is highly structured.

Binary Mode Operations: All file operations must be done in binary mode to avoid any data corruption. This is crucial for non-text files, where interpreting the data as text could lead to errors.

No Missing Chunks: All parts of the file must be present. Missing chunks can lead to incomplete or corrupted files, which is particularly noticeable in media files like videos or music.

Overall, this method is a reliable way to reassemble file chunks of any type, as long as the chunks are complete, in the correct order, and handled in binary mode.

