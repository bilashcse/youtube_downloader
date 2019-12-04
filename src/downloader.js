const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl');

const dir = './videos';

const download = async (url) => {
  try {
    const video = youtubedl(url);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    video.on('error', (err) => {
      throw new Error(err.stack);
    });

    let size = 0;
    let currentVideo;
    video.on('info', (info) => {
      currentVideo = info;
      size = info.size;
      const output = path.resolve(`${dir}/${info.title}.mp4`);
      video.pipe(fs.createWriteStream(output));
    });

    let pos = 0;
    video.on('data', (chunk) => {
      pos += chunk.length;
      if (size) {
        const percent = ((pos / size) * 100).toFixed(2);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(1);
        process.stdout.write(`Progress: ${percent}%`);
      }
    });

    video.on('next', download);

    video.on('end', () => {
      console.log(`\n${currentVideo.title} : Download Finished.`);
    });
  } catch (err) {
    console.error(err);
  }
};

download('https://www.youtube.com/playlist?list=PLEFA9E9D96CB7F807');
download('https://www.youtube.com/watch?v=svJcElNCdrw');
