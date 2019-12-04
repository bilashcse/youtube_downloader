const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl');

const dir = './videos';

const download = async (url) => {
  const video = youtubedl(url);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  video.on('error', (err) => {
    console.log(err.stack);
  });

  let size = 0;
  let currentVideo;
  video.on('info', (info) => {
    // console.log(info);
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
};

download('https://www.youtube.com/playlist?list=PLEFA9E9D96CB7F807');
download('https://www.youtube.com/watch?v=svJcElNCdrw');
