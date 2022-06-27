# Youter
Youtube bulk mp3 downloader based on youtube-mp3-downloader by ytb2mp3: https://github.com/ytb2mp3/youtube-mp3-downloader
The idea was to paste multiple video URLs into a text file and automatically download all of them.

DISCLAIMER: This project was designed for my personal needs but works quite well, so I decided to make it public. It is just an implementation of the youtube-mp3-downloader module, so all credit should go to ytb2mp3. I wrote and tested it on Linux. Windows compatibility hasn't been tested yet (runs in WSL tho).

# Before use
### Install ffmpeg and all dependencies. ->
(in the project's directory)
    
    npm i

___
Windows: http://ffmpeg.org/download.html

Linux:

    sudo apt install ffmpeg

___
### Install NodeJS (if necessary) ->

Windows: https://nodejs.org/en/download/

Linux:

    sudo apt install nodejs
___

### Set output folder path and ffmpeg binary location in config.json
```json
{
"OutputPath": "./download",
"DefaultThreads": 1,
"ffmpegPath": "ffmpeg",
"Quality": "highestaudio",
"ReportDelay": 500,
"AllowWebM": false
}
```

# Usage
Copy-paste desired youtube video links into URL.txt (one URL per line) and run index.js in the script's directory. URL.txt must be located in the same folder as index.js. The script should print out a welcome screen followed by youtube video ID list. After a while a download process begins outputting progress information. 

Output should look something like this:

![image](https://user-images.githubusercontent.com/98588523/175989319-adbb1d3f-d14c-4db5-a4a5-413a217009ef.png)


    node index.js

# Multithreaded mode
The script downloads one file at a time by default. By adding argument "multithread" each ID gets its own download instance (all running at the same time), speeding up the total download speed.

    node index.js multithread

___
You can also set your own number of threads by using argument "threads" and a number.

example:

    node index.js threads 4

### WARNING: Use with caution. Multithreaded mode might not be stable at higher number of links.
