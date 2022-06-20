# Youter
Youtube bulk mp3 downloader based on youtube-mp3-downloader by ytb2mp3: https://github.com/ytb2mp3/youtube-mp3-downloader

DISCLAIMER: This project was designed for my personal needs but it works quite well, so I decided to make this repo public. It is just an implementation of the youtube-mp3-downloader module, so all credit should go to ytb2mp3. I wrote and tested it on Linux. Windows compatibility hasn't been tested yet. 

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
![image](https://user-images.githubusercontent.com/98588523/174477775-7de94051-483b-4183-a764-447cb2cbb1d4.png)

# Usage
Copy-paste desired youtube video links into URL.txt (one URL per line) and run index.js. The scrip should print out a welcome screen folowed by youtube video IDs. After a while a download process should begin outputting progress information. 
