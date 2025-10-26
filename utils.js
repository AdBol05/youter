import { spawn } from 'child_process';

export function convertStreamToMp3(inputStream, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        '-i', 'pipe:0',        // read from stdin
        '-vn',                 // no video
        '-ar', '44100',        // audio rate
        '-ac', '2',            // channels
        '-b:a', '192k',        // bitrate
        '-f', 'mp3',           // output format
        outputFile
      ]);
  
      inputStream.pipe(ffmpeg.stdin);
  
      ffmpeg.stderr.on('data', data => process.stderr.write(data));
      ffmpeg.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });
    });
  }
