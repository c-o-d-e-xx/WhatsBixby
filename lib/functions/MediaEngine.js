const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const {
	spawn
} = require("child_process");
const ff = require("fluent-ffmpeg");
const MEDIA_DIR = path.join(__dirname, "temp/media");

function getRandomFileName(ext = '') {
    const random = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return path.join(MEDIA_DIR, `${random}.${ext}`);
}

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            // Ensure media directory exists
            if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

            const tmp = getRandomFileName(ext);
            const out = getRandomFileName(ext2);
            console.log("TMP FILE:", tmp, "-> OUT FILE:", out);

            await fs.promises.writeFile(tmp, buffer);

            spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])
                .on('error', reject)
                .on('close', async (code) => {
                    try {
                        await fs.promises.unlink(tmp); // Cleanup input
                        if (code !== 0) return reject(code);
                        const result = await fs.promises.readFile(out);
                        await fs.promises.unlink(out); // Cleanup output
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
}

function cutAudio(buff,start,end){
	let buf;
const media = fs.writeFileSync('./media/cut.mp3',buff)
	ff(media)
  .setStartTime('00:'+start)
  .setDuration(end)
  .output('./media/ouputcut.mp3')
  .on('end', function(err) {
    if(!err) {
	buf = fs.readFileSync('./media/ouputcut.mp3')
	}
  })
  .on('error', err => buf = false)
  return buf
}

function cutVideo(buff,start,end){
	let buf;
const media = fs.writeFileSync('./media/cut.mp4',buff)
	ff(media)
  .setStartTime('00:'+start)
  .setDuration(end)
  .output('./media/ouputcut.mp4')
  .on('end', function(err) {
    if(!err) {
	buf = fs.readFileSync('./media/ouputcut.mp4')
	}
  })
  .on('error', err => buf = false)
  return buf
}
function toAudio(buffer, ext) {
	return ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext || 'mp3', 'mp3')
}

function toPTT(buffer, ext) {
    return ffmpeg(
        buffer,
        ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10', '-f', 'opus'],
        ext || 'mp3',
        'ogg' // <== send in .ogg container
    );
}

async function toGif(source) {
  const isUrl = typeof source === "string" && /^https?:\/\//.test(source);
  const fileExt = isUrl ? source.split('.').pop().toLowerCase() : source.split('.').pop().toLowerCase();
  const isVideo = ["mp4", "mov", "avi", "webm"].includes(fileExt);

  // Choose correct endpoint based on input type
  const endpoint = isVideo
    ? "https://ezgif.com/video-to-gif"
    : "https://ezgif.com/webp-to-gif";

  const form = new FormData();
  form.append("new-image-url", isUrl ? source : "");
  if (!isUrl) {
    const buffer = fs.readFileSync(source); // Use buffer to avoid redirect issues
    form.append("new-image", buffer, `input.${fileExt}`);
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    ...form.getHeaders(),
  };

  const res = await fetch(endpoint, {
    method: "POST",
    body: form,
    headers,
  });

  const html = await res.text();
  const { document } = new JSDOM(html).window;

  const form2 = new FormData();
  const obj = {};
  for (const input of document.querySelectorAll("form input[name]")) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }

  if (!obj.file) throw new Error("Failed to extract file reference for GIF conversion.");

  const res2 = await fetch(`${endpoint}/${obj.file}`, {
    method: "POST",
    body: form2,
    headers: {
      ...form2.getHeaders(),
      "User-Agent": headers["User-Agent"],
    },
  });

  const html2 = await res2.text();
  const { document: document2 } = new JSDOM(html2).window;

  const gifImg = document2.querySelector("#output > p.outfile > img");
  if (!gifImg || !gifImg.src) {
    fs.writeFileSync("failed-toGif-response.html", html2);
    throw new Error("Failed to extract GIF URL");
  }

  return new URL(gifImg.src, res2.url).toString();
}

async function webp2png(source) {
  const form = new FormData();
  const isUrl = typeof source === "string" && /^https?:\/\//.test(source);
  form.append("new-image-url", isUrl ? source : "");
  form.append("new-image", isUrl ? "" : source, "image.webp");

  const res = await fetch("https://s6.ezgif.com/webp-to-png", {
    method: "POST",
    body: form,
  });

  const html = await res.text();
  const { document } = new JSDOM(html).window;

  const form2 = new FormData();
  const obj = {};

  for (const input of document.querySelectorAll("form input[name]")) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }

  const res2 = await fetch("https://ezgif.com/webp-to-png/" + obj.file, {
    method: "POST",
    body: form2,
  });

  const html2 = await res2.text();
  const { document: document2 } = new JSDOM(html2).window;

  const imgElement = document2.querySelector("div#output > p.outfile > img");
  if (!imgElement) throw new Error("Failed to extract PNG URL");

  return new URL(imgElement.src, res2.url).toString();
}

module.exports = { cutAudio, cutVideo, toAudio, toPTT, toGif, webp2png };
