# Youter
Youtube bulk mp3 downloader based on youtube-mp3-downloader by ytb2mp3: https://github.com/ytb2mp3/youtube-mp3-downloader
The idea was to paste multiple video URLs into a text file and automatically download all of them.

DISCLAIMER: This project was designed for my personal needs but works quite well, so I decided to make it public. It is just an implementation of the youtube-mp3-downloader module, so all credit should go to ytb2mp3. I wrote and tested it on Linux. Windows compatibility hasn't been tested yet.

# Before use
Install youtube-mp3-downloader and ffmpeg. ->
    
    npm install youtube-mp3-downloader -save

Windows: http://ffmpeg.org/download.html

Linux:

    sudo apt install ffmpeg

___
Install NodeJS (if necessary) ->

Windows: https://nodejs.org/en/download/

Linux:

    sudo apt install nodejs
___

Set ffmpeg binary path and output path in index.js
![image](https://user-images.githubusercontent.com/98588523/174765614-8503eca9-9bc7-4f14-96e1-b4ade817c73a.png)

# Usage
Copy-paste desired youtube video links into URL.txt (one URL per line) and run index.js in the script's directory. URL.txt must be located in the same folder as index.js. The script should print out a welcome screen followed by youtube video ID list. After a while a download process begins outputting progress information. 

    node index.js

# Multithreaded mode
The script downloads one file at a time by default. By adding argument "multithread" each download gets its own thread(all running at the same time), speeding up the total download speed.

    node index.js multithread

WARNING: Use with caution. Multithreaded mode might not be stable at higher number of links.
