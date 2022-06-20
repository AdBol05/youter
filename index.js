const fs = require("fs");
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

const file = fs.readFileSync("URL.txt").toString("utf-8");
let lines = file.split("\n");
let table = [];
let ids = [];

console.log("__  __            __          ");
console.log("\\ \\/ /___  __  __/ /____  _____");
console.log(" \\  / __ \\/ / / / __/ _ \\/ ___/");
console.log(" / / /_/ / /_/ / /_/  __/ /    ");
console.log("/_/\\____/\\__,_/\\__/\\___/_/     ");

//resolve video IDs
lines.forEach(line => {
        line = line.replace("&list","");
        table.push(line.split("=")[1]);});
ids = table.filter(element => {return element !== undefined;});

if (ids[0] === undefined){console.error('\x1b[31m%s\x1b[0m',"No video ID available"); process.exit(1);}

//YoutubeMp3Downloder setup
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": "ffmpeg",                 // FFmpeg binary location
    "outputPath": "./download",             // Output file location
    "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
    "queueParallelism": ids.length,         // Download parallelism (default: 1)
    "progressTimeout": 500,                 // Interval in ms for the progress reports (default: 1000)
    "allowWebm": false                      // Enable download from WebM sources (default: false)
});

console.log("\n");
console.log("List of videos to be downloaded:");
console.log(ids);
console.log("progress: \n");

//download all links and save mp3
ids.forEach( id => {
        console.log("started process for id %s \n", id);
        YD.download(id);
});

YD.on("finished", function(err, data) {console.log('\x1b[32m%s\x1b[0m',"Downloaded MP3 to:", data.file); console.log("\n");});
YD.on("error", function(error) {console.error('\x1b[31m%s\x1b[0m',error); console.log("\n");});
YD.on("progress", function(progress) {console.log(progress.videoId, ":", progress.progress.percentage.toFixed(2), "\%"); console.log("\n");});
