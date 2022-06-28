const AsciiBar = require('ascii-bar').default;
const fs = require("fs");
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

var config = JSON.parse(fs.readFileSync("./config.json", "utf-8")); //read config

const args = process.argv.slice(2); //get process arguments
let parallelism = config.DefaultThreads; //set default number of threads

const file = fs.readFileSync("URL.txt").toString("utf-8");
let lines = file.split("\n");
let table = []; //temporary ID storage for cleaning
let ids = []; //list of video IDs
let prn = 0; //number of processes finished
let bars = {}; //loading bars object

//welcome screen
console.log('\x1b[32m%s\x1b[0m',"__  __            __               ");
console.log('\x1b[32m%s\x1b[0m',"\\ \\/ /___  __  __/ /____  _____  ");
console.log('\x1b[32m%s\x1b[0m'," \\  / __ \\/ / / / __/ _ \\/ ___/ ");
console.log('\x1b[32m%s\x1b[0m'," / / /_/ / /_/ / /_/  __/ /        ");
console.log('\x1b[32m%s\x1b[0m',"/_/\\____/\\__,_/\\__/\\___/_/     ");

//check if output path exists
if (!fs.existsSync(config.OutputPath)) {fs.mkdirSync(config.OutputPath);}

//resolve video IDs
lines.forEach(line => {
        line = line.replace("&list","");
        table.push(line.split("=")[1]);});
ids = table.filter(element => {return element !== undefined;}); //clean up

if (ids[0] === undefined){console.error('\x1b[31m%s\x1b[0m',"\n Error: No video ID available"); process.exit(1);} //exit if no IDs available

if (args[0] === "multithread"){parallelism = ids.length;} //set threads to number of IDs
if (args[0] === "threads"){parallelism = args[1];} //set custom number of threads

//YoutubeMp3Downloder setup
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": config.ffmpegPath,        // FFmpeg binary location
    "outputPath": config.OutputPath,        // output folder location
    "youtubeVideoQuality": config.Quality,  // Desired video quality
    "queueParallelism": parallelism,        // Download parallelism
    "progressTimeout": config.ReportDelay,  // Interval in ms for the progress reports
    "allowWebm": config.AllowWebM           // Enable download from WebM sources
});

//basic info
console.log("\n");
console.log("--------------------------------");
console.log("List of videos to be downloaded:");
console.log(ids);
console.log("--------------------------------");
console.log("Number of threads: %d", parallelism);
console.log("-------------------------------- \n");
console.log("progress: \n");

//download all links and save mp3
ids.forEach( id => {
    console.log("started process for id %s", id);
    YD.download(id);
    bars[id] = new AsciiBar({ //set progress bar for every video
        undoneSymbol: config.bar.undoneSymbol,
        doneSymbol: config.bar.doneSymbol,
        width: config.bar.length,
        formatString: '#percent #bar',
        total: 100,
        enableSpinner: false,
        lastUpdateForTiming: false,
        autoStop : false,
        print: true,
        start: 0,
        stream: process.stdout,
        hideCursor: false,
    });
});

console.log("\n");

YD.on("error", function(error) {console.error('\x1b[31m%s\x1b[0m',error); console.log("\n");}); //error reports
YD.on("progress", function(progress) { //download progress reports
    bars[progress.videoId].update(progress.progress.percentage.toFixed()); //update progress bars
    console.log('\x1b[32m%s\x1b[0m',progress.videoId);
});
YD.on("finished", function(err, data) { //download finished
    console.log('\x1b[32m%s\x1b[0m',"\n Downloaded MP3 to:", data.file); //print download path
    console.log("\n");
    prn++;
    if (prn >= ids.length){process.exit(0);} //exit when all downloads finished
});
