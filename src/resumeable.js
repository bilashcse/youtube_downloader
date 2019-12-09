const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl');

const dir = './videos';
let downloaded = 0;

const getInfo = async (url) => {
  try {
    return new Promise((resolve, reject) => {
      const video = youtubedl(url);

      video.on('error', (err) => {
        reject(err.stack);
      });

      video.on('info', (info) => {
        const output = path.resolve(`${dir}/${info.id}.mp4`);
        resolve(output);
      });
    });
  } catch (err) {
    throw new Error(err);
  }
};

const downloadProgress = async (url) => {
  if (fs.existsSync(url)) {
    downloaded = fs.statSync(url).size;
  }
  return downloaded;
};

const download = async (url) => {
  try {
    return new Promise((resolve, reject) => {
      const video = youtubedl(url, ['--format=18'], {
        start: downloaded,
        cwd: dir,
      });
      let totalSize = 0;

      video.on('error', (err) => {
        reject(err.stack);
      });
      video.on('info', (info) => {
        totalSize = info.size;
        const name = `${info.id}.mp4`;

        if (downloaded > 0) {
          console.log(`Remaining bytes: ${info.size} | Resuming from: ${downloaded}`);
        } else {
          console.log('New Video downloading ');
        }

        video.pipe(fs.createWriteStream(`${dir}/${name}`));
      });

      let pos = 0;
      video.on('data', (chunk) => {
        pos += chunk.length;
        if (totalSize) {
          const percent = ((pos / totalSize) * 100).toFixed(2);
          process.stdout.cursorTo(0);
          process.stdout.clearLine(1);
          process.stdout.write(`Progress: ${percent}%`);
        }
      });

      video.on('end', () => {
        console.log('\nFinished downloading!');
        resolve();
      });
    });
  } catch (err) {
    throw new Error(err);
  }
};

const init = async () => {
  try {
    const url = 'https://www.youtube.com/watch?v=bJUICCX2rE8';
    const output = await getInfo(url);
    await downloadProgress(output);
    await download(url);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  resumeable: init,
};
