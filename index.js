const AsciiBar = require('ascii-bar').default;
const fs = require("fs");
var YoutubeMp3Downloader = require("youtube-mp3-downloader");

if(fs.existsSync("./config.json")) {var config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));} //read config if possible
else{console.error('\x1b[31m%s\x1b[0m',"\n Error: Failed to read config.json. File does not exist."); process.exit(1);} //exit if config file is not found

const args = process.argv.slice(2); //get process arguments
let parallelism = config.DefaultThreads; //set default number of threads

//welcome screen
console.log('\x1b[32m%s\x1b[0m',"__  __            __               ");
console.log('\x1b[32m%s\x1b[0m',"\\ \\/ /___  __  __/ /____  _____  ");
console.log('\x1b[32m%s\x1b[0m'," \\  / __ \\/ / / / __/ _ \\/ ___/ ");
console.log('\x1b[32m%s\x1b[0m'," / / /_/ / /_/ / /_/  __/ /        ");
console.log('\x1b[32m%s\x1b[0m',"/_/\\____/\\__,_/\\__/\\___/_/     ");

//check if URL file exists (create and exit if not)
if (!fs.existsSync(config.URLpath)) {console.error('\x1b[31m%s\x1b[0m','\n Error: ' + config.URLpath + ' not found, created.\n PLease paste desired video links into this file.');
    fs.openSync(config.URLpath, 'w');
    process.exit(1);
}

const file = fs.readFileSync(config.URLpath).toString("utf-8"); //read URL file
let lines = file.split("\n"); //get individual lines

let table = []; //temporary ID storage for cleaning
let ids = []; //list of video IDs
let prn = 0; //number of finished processes
let bars = {}; //loading bars object

//check if output path exists (create if not)
if (!fs.existsSync(config.OutputPath)) {fs.mkdirSync(config.OutputPath);}

//resolve video IDs
lines.forEach(line => {
    if (!line.includes('=')){line = line.split('').reverse().join('').replace("/", "=").split('').reverse().join('');} //if link doesn't contain "=", replace last "/" with "="
    line = line.replace("&list",""); //get rid of "&list" for easier ID separation
    table.push(line.split("=")[1]);}); //add separated IDs to table
ids = table.filter(element => {return element !== undefined;}); //get rid of undefined elements

if (ids[0] === undefined){console.error('\x1b[31m%s\x1b[0m',"\n Error: No video ID available"); process.exit(1);} //exit if no IDs available

if (args[0] === "multithread"){parallelism = ids.length;} //set threads to number of IDs
if (args[0] === "threads"){ //set custom number of threads
    parallelism = args[1];
    if(isNaN(parallelism)){console.error('\x1b[31m%s\x1b[0m',"\n Error: Invalid argument"); process.exit(9);} //exit if input is not a number
}

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
console.log("URL file path:", config.URLpath);
console.log("Download folder path:", config.OutputPath);
console.log("--------------------------------");
console.log("Number of threads: %d", parallelism);
console.log("-------------------------------- \n");
console.log("progress: \n");

//download all links and save mp3
ids.forEach( id => {
    console.log("started process for id %s", id);
    YD.download(id); //start download process
    bars[id] = new AsciiBar({ //set progress bar for every video
        undoneSymbol: config.bar.undoneSymbol,  //symbol for undone part of bar
        doneSymbol: config.bar.doneSymbol,      //symbol for done part of bar
        width: config.bar.length,               //width of bar
        formatString: '#percent #bar',          //format of bar
        autoStop : false,                       //disable autoStop
        stream: process.stdout,                 //output stream
    });
});

console.log("\n");

YD.on("error", function(error) {console.error('\x1b[31m%s\x1b[0m',error); console.log("\n");}); //error reports
YD.on("progress", function(progress) { //download progress reports
    bars[progress.videoId].update(progress.progress.percentage.toFixed()); //update progress bars
    console.log('\x1b[32m%s\x1b[0m',progress.videoId); //print video ID next to progress bar
});
YD.on("finished", function(err, data) { //download finished
    console.log('\x1b[32m%s\x1b[0m',"\n Downloaded MP3 to:", data.file); //print download path
    console.log("\n");
    prn++; //increase counter of finished downloads
    if (prn >= ids.length){
        if(config.ClearURL){ //clear URL.txt file if enabled in config
            console.log("clearing URL file");
            fs.writeFile(config.URLpath, "", function(error){console.error(error);});
        }
        process.exit(0); //exit when all downloads finished
    }
});