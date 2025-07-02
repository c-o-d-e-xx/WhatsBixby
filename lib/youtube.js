/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const  { Innertube, UniversalCache, Utils } = require("youtubei.js");
const yts = require("yt-search")
const fs = require("fs")

const validQueryDomains = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
  ]);

  const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
  const getURLVideoID = link => {
    const parsed = new URL(link.trim());
    let id = parsed.searchParams.get('v');
    if (validPathDomains.test(link.trim()) && !id) {
      const paths = parsed.pathname.split('/');
      id = parsed.host === 'youtu.be' ? paths[1] : paths[2];
    } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
      throw Error('Not a YouTube domain');
    }
    if (!id) {
      throw Error(`No video id found: "${link}"`);
    }
    id = id.substring(0, 11);
    return id;
  };

const ffmpeg = require('fluent-ffmpeg');
const googleTTS = require('google-tts-api');
const {
    translate
} = require('@vitalets/google-translate-api');
const stream2buffer = async (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
};

async function searchYT(q) {
    try {
        const res = await yts(q);
        let aa = [];
            res.all.filter(a=>a.type=='video').map((r) => aa.push({title: r.title, url: r.url}))
            return aa;
    } catch (e) {
        return e
    }
}
const downloadMp3 = async (url) => {
    let video_id = getURLVideoID(url);
    try {
        const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        const stream = await yt.download(video_id, {
            type: 'audio', // audio, video or video+audio
            quality: 'bestefficiency', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
            format: 'mp4' // media container format 
          });
          const buffers = [];
          for await (const data of Utils.streamToIterable(stream)) {
            buffers.push(data);
          }
          return Buffer.concat(buffers);
    } catch (e) {
        return "rejected";
    }
};
const downloadMp4 = async (url) => {
    let video_id = getURLVideoID(url);
    try {
        const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
        const stream = await yt.download(video_id, {
            type: 'video+audio', // audio, video or video+audio
            quality: 'bestefficiency', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
            format: 'mp4' // media container format 
          });
          const buffers = [];
          for await (const data of Utils.streamToIterable(stream)) {
            buffers.push(data);
          }
          return Buffer.concat(buffers);
    } catch (e) {
        return "rejected";
    }
};


function GenListMessage(title, options, desc, footer) {
    if (!title) return false;
    if (!options) return false;
    if (!options[0]) return "options must be array and uts have values";
    let response = "*_" + title + "_*\n\n",
        n = 1;
        if(desc) response += desc +'\n\n';
    options.map((o) => {
        response += `*${n++}*. ` + '```' + `${o}` + '```\n'
    });
    if(footer) response += footer;
    return response;
}
const TTS = async (text, lang) => {
    try {
        const options = {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com'
        };
        const audioBase64Array = await googleTTS.getAllAudioBase64(text, options);
        const base64Data = audioBase64Array.map((audio) => audio.base64).join();
        const fileData = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('tts.mp3', fileData, {
            encoding: 'base64'
        });
        return new Promise((resolve) => {
            ffmpeg('tts.mp3').audioCodec('libopus').save('tts.opus').on('end', async () => {
                resolve(fs.readFileSync('tts.opus'));
            });
        });
    } catch (error) {
        throw new Error(error.message);
    }
};
const TRT = async (text, lang = 'en') => {
    const res = await translate(text, {
        to: lang,
        autoCorrect: true
    }).catch(_ => "requst faild with status code 303")
    return res;
}
const getYTInfo = async (url) => {
const video_id = getURLVideoID(url);
                 const res = await yts({ videoId:video_id })
                            const {
                                title,
                                description,
                                seconds,
                                uploaddate,
                                views,
                                thumbnail,
                                author,
                                videoId
                            } = res
                            return ({
                                title,
                                description,
                                seconds,
                                uploaddate,
                                views,
                                thumbnail,
                                author:author.name,
                                videoId
                            });
                  }
                    module.exports = {
                        stream2buffer,
                        searchYT,
                        downloadMp3,
                        downloadMp4,
                        GenListMessage,
                        TTS,
                        TRT,
                        getYTInfo
                    };
