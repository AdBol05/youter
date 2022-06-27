const AsciiBar = require('ascii-bar').default;

const fs = require("fs");
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

var config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

const args = process.argv.slice(2);
let parallelism = config.DefaultThreads;

const file = fs.readFileSync("URL.txt").toString("utf-8");
let lines = file.split("\n");
let table = [];
let ids = [];

let prn = 0;

//welcome screen
console.log('\x1b[32m%s\x1b[0m',"__  __            __          ");
console.log('\x1b[32m%s\x1b[0m',"\\ \\/ /___  __  __/ /____  _____");
console.log('\x1b[32m%s\x1b[0m'," \\  / __ \\/ / / / __/ _ \\/ ___/");
console.log('\x1b[32m%s\x1b[0m'," / / /_/ / /_/ / /_/  __/ /    ");
console.log('\x1b[32m%s\x1b[0m',"/_/\\____/\\__,_/\\__/\\___/_/     ");

//check if output path exists
if (!fs.existsSync(config.OutputPath)) {fs.mkdirSync(config.OutputPath);}

//resolve video IDs
lines.forEach(line => {
        line = line.replace("&list","");
        table.push(line.split("=")[1]);});
ids = table.filter(element => {return element !== undefined;});

if (ids[0] === undefined){console.error('\x1b[31m%s\x1b[0m',"No video ID available"); process.exit(1);}

let bars = {};

if (args[0] === "multithread"){parallelism = ids.length;}
if (args[0] === "threads"){parallelism = args[1];}

//YoutubeMp3Downloder setup
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": config.ffmpegPath,        // FFmpeg binary location
    "outputPath": config.OutputPath,        // output folder location
    "youtubeVideoQuality": config.Quality,  // Desired video quality
    "queueParallelism": parallelism,        // Download parallelism
    "progressTimeout": config.ReportDelay,  // Interval in ms for the progress reports
    "allowWebm": config.AllowWebM           // Enable download from WebM sources
});

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
        undoneSymbol: "-",
        doneSymbol: "#",
        width: 70,
        formatString: '#percent #bar',
        total: 100,
        enableSpinner: false,
        lastUpdateForTiming: false,
        autoStop : false,
        print: true,
        start: 0,
        startDate: new Date().getTime(),
        stream: process.stdout,
        hideCursor: false,
    });
});

console.log("\n");

YD.on("error", function(error) {console.error('\x1b[31m%s\x1b[0m',error); console.log("\n");});
YD.on("progress", function(progress) {
    bars[progress.videoId].update(progress.progress.percentage.toFixed());
    console.log('\x1b[32m%s\x1b[0m',progress.videoId);
});

YD.on("finished", function(err, data) {
        console.log('\x1b[32m%s\x1b[0m',"\n Downloaded MP3 to:", data.file);
        console.log("\n");
        prn++;
        if (prn >= ids.length){process.exit(0);}
});
