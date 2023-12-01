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

