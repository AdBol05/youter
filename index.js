//import AsciiBar from 'ascii-bar';
import * as fs from 'fs';
//const { createFFmpeg } = require('@ffmpeg/ffmpeg');
import { YtDlp } from 'ytdlp-nodejs';
const ytdlp = new YtDlp();

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
    line = line.split("?si=")[0];
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



//basic info
console.log("\n");
console.log("--------------------------------");
console.log("List of videos to be downloaded:");
console.table(ids);
console.log("--------------------------------");
console.log("URL file path:", config.URLpath);
console.log("Download folder path:", config.OutputPath);
console.log("--------------------------------");
console.log("Number of threads: %d", parallelism);
console.log("--------------------------------");
console.log("Clear URL file: " + config.ClearURL);
console.log("--------------------------------");
console.log("progress: \n");

ids.forEach( id => {
    /*bars[id] = new AsciiBar({
        undoneSymbol: config.bar.undoneSymbol,
        doneSymbol: config.bar.doneSymbol,
        width: config.bar.length,
        formatString: '#percent #bar',
        autoStop : false,
        stream: process.stdout,
    });*/
    let url = `https://www.youtube.com/watch?v=${id}`;
    ytdlp.getTitleAsync(url).then((title) => {
        console.log(`started process for id ${id} -> ${title}`);
        ytdlp.downloadAsync(
            url,
            {
                format: {
                    filter: "audioonly",
                    type: "mp3",
                    quality: config.Quality
                },
                //filename: title,
                output: `${config.OutputPath}/${title.trim()}.webm`,
                postProcessors: [{
                    key: "FFmpegExtractAudio",
                    preferredCodec: "mp3",
                    preferredQuality: "192",
                }],
                onProgress: (progress) => {
                    if(progress.status === 'downloading'){
                        console.log(`\x1b[32m[${id}]\x1b[0m ${title.trim()}\n\x1b[32m[${progress.percentage_str}]\x1b[0m ${progress.downloaded_str}/${progress.total_str} @ ${progress.speed_str} - ${progress.eta_str}\n`);
                    }
                    else if(progress.status === 'finished'){
                        console.log('\x1b[32m%s\x1b[0m',"\n Downloaded MP3 to:", `${config.OutputPath}/${title.trim()}.mp3`, ` ${progress.total_str}`);
                        prn++;
                        if (prn >= ids.length){
                            if(config.ClearURL){console.log("Clearing URL file"); fs.writeFile(config.URLpath, "", function(error){console.error(error);});}
                            process.exit(0);
                        }
                    }
                    else {
                        console.log("Unknown status!");
                        console.log(progress);
                    }
                } 
            }
        ).then(() => {
            exec(`ffmpeg -i "${config.OutputPath}/${title.trim()}.webm" -vn -ab 192k -ar 44100 -y "${config.OutputPath}/${title.trim()}.mp3"`);
          });
    });
});

console.log("\n");

/*YD.on("error", function(error) {console.error('\x1b[31m%s\x1b[0m',error); console.log("\n");}); //error reports
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
            console.log("Clearing URL file");
            fs.writeFile(config.URLpath, "", function(error){console.error(error);});
        }
        process.exit(0); //exit when all downloads finished
    }
});*/
