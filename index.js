import * as fs from 'fs';
import { YtDlp } from 'ytdlp-nodejs';
import {convertStreamToMp3} from "./utils.js";
const ytdlp = new YtDlp();

if(fs.existsSync("./config.json")) {var config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));}
else{console.error('\x1b[31m%s\x1b[0m',"\n Error: Failed to read config.json. File does not exist."); process.exit(1);}

const args = process.argv.slice(2);
let parallelism = config.DefaultThreads;

console.log('\x1b[32m%s\x1b[0m',"__  __            __               ");
console.log('\x1b[32m%s\x1b[0m',"\\ \\/ /___  __  __/ /____  _____  ");
console.log('\x1b[32m%s\x1b[0m'," \\  / __ \\/ / / / __/ _ \\/ ___/ ");
console.log('\x1b[32m%s\x1b[0m'," / / /_/ / /_/ / /_/  __/ /        ");
console.log('\x1b[32m%s\x1b[0m',"/_/\\____/\\__,_/\\__/\\___/_/     ");

if (!fs.existsSync(config.URLpath)) {console.error('\x1b[31m%s\x1b[0m','\n Error: ' + config.URLpath + ' not found, created.\n PLease paste desired video links into this file.');
    fs.openSync(config.URLpath, 'w');
    process.exit(1);
}

const file = fs.readFileSync(config.URLpath).toString("utf-8");
let lines = file.split("\n");

let table = [];
let ids = []; 

if (!fs.existsSync(config.OutputPath)) {fs.mkdirSync(config.OutputPath);}

lines.forEach(line => {
    line = line.split("?si=")[0];
    if (!line.includes('=')){line = line.split('').reverse().join('').replace("/", "=").split('').reverse().join('');} //if link doesn't contain "=", replace last "/" with "="
    line = line.replace("&list","");
    table.push(line.split("=")[1]);});
ids = table.filter(element => {return element !== undefined;});

if (ids[0] === undefined){console.error('\x1b[31m%s\x1b[0m',"\n Error: No video ID available"); process.exit(1);}

if (args[0] === "multithread"){parallelism = ids.length;}
if (args[0] === "threads"){
    parallelism = args[1];
    if(isNaN(parallelism)){console.error('\x1b[31m%s\x1b[0m',"\n Error: Invalid argument"); process.exit(9);}
}

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

ids.forEach( async (id) => {
    let url = `https://www.youtube.com/watch?v=${id}`;
    
    let title = await ytdlp.getTitleAsync(url)
    title = title.replace(/[\\/:*?"<>|]/g, '');
    let path = `${config.OutputPath}/${title.trim()}.mp3`
    
    if(fs.existsSync(path)){console.log(`\x1b[31mFile ${path} already exists! Skipping\x1b`);}
    else{
        console.log(`\x1b[32m[${id}]\x1b[0m started process for id -> ${title}`);
    
        let stream = ytdlp.stream(
            url,
            {
                filter: "audioonly",
                format: "bestaudio",
                onProgress: (progress) => {
                    if(progress.status === 'downloading'){console.log(`\n\x1b[32m[${id}]\x1b[0m ${title.trim()}\n\x1b[32m[${progress.percentage_str}]\x1b[0m ${progress.downloaded_str}/${progress.total_str} @ ${progress.speed_str} - ${progress.eta_str}\n`);}
                    else if(progress.status === 'finished'){console.log('\x1b[32m%s\x1b[0m',"\n Downloaded MP3 to:", `${config.OutputPath}/${title.trim()}.mp3`, ` ${progress.total_str}`);}
                    else {console.log("Unknown status!");console.log(progress);}
                }
            },
        );
    
        convertStreamToMp3(stream, path);
    }
});

