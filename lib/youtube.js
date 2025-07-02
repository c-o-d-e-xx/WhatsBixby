/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Innertube, UniversalCache, Utils } = require("youtubei.js");
const yts = require("yt-search");
const fs = require("fs").promises; // Using promises version for better async handling
const ffmpeg = require('fluent-ffmpeg');
const googleTTS = require('google-tts-api');
const { translate } = require('@vitalets/google-translate-api');

// Constants
const VALID_QUERY_DOMAINS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
]);

const VALID_PATH_DOMAINS = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

// YouTube URL ID Extractor
const getURLVideoID = (link) => {
    try {
        if (!link || typeof link !== 'string') {
            throw new Error('Invalid URL provided');
        }

        const parsed = new URL(link.trim());
        let id = parsed.searchParams.get('v');

        if (VALID_PATH_DOMAINS.test(link.trim()) && !id) {
            const paths = parsed.pathname.split('/');
            id = parsed.hostname === 'youtu.be' ? paths[1] : paths[2];
        } else if (parsed.hostname && !VALID_QUERY_DOMAINS.has(parsed.hostname)) {
            throw new Error('Not a YouTube domain');
        }

        if (!id) {
            throw new Error(`No video id found: "${link}"`);
        }

        id = id.substring(0, 11);
        if (!/^[\w-]{11}$/.test(id)) {
            throw new Error('Invalid video ID format');
        }

        return id;
    } catch (error) {
        console.error('URL parsing error:', error);
        throw error;
    }
};

// Stream to Buffer converter with progress tracking
const stream2buffer = async (stream) => {
    const chunks = [];
    let totalSize = 0;

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            totalSize += chunk.length;
            if (totalSize > VIDEO_SIZE_LIMIT) {
                reject(new Error('Stream size limit exceeded'));
                return;
            }
            chunks.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on('error', reject);

        // Add timeout
        setTimeout(() => {
            reject(new Error('Stream timeout'));
        }, TIMEOUT);
    });
};

// YouTube Search with error handling and validation
async function searchYT(query) {
    if (!query || typeof query !== 'string') {
        throw new Error('Invalid search query');
    }

    try {
        const results = await yts(query);
        return results.all
            .filter(result => result.type === 'video')
            .map(video => ({
                title: video.title,
                url: video.url,
                duration: video.duration,
                thumbnail: video.thumbnail,
                views: video.views
            }))
            .slice(0, 10); // Limit to top 10 results
    } catch (error) {
        console.error('YouTube search error:', error);
        throw new Error('Failed to search YouTube');
    }
}

// Enhanced MP3 Downloader
const downloadMp3 = async (url) => {
    try {
        const video_id = getURLVideoID(url);
        let attempts = 0;
        let lastError;

        while (attempts < MAX_RETRIES) {
            try {
                const yt = await Innertube.create({
                    cache: new UniversalCache(false),
                    generate_session_locally: true,
                    fetch: {
                        timeout: TIMEOUT
                    }
                });

                const stream = await yt.download(video_id, {
                    type: 'audio',
                    quality: 'bestefficiency',
                    format: 'mp4'
                });

                const buffer = await stream2buffer(Utils.streamToIterable(stream));
                if (!buffer || buffer.length === 0) {
                    throw new Error('Empty audio buffer received');
                }

                return buffer;
            } catch (error) {
                lastError = error;
                attempts++;
                if (attempts < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        }

        throw lastError;
    } catch (error) {
        console.error('MP3 download error:', error);
        return 'download_failed';
    }
};

// Enhanced MP4 Downloader
const downloadMp4 = async (url) => {
    try {
        const video_id = getURLVideoID(url);
        let attempts = 0;
        let lastError;

        while (attempts < MAX_RETRIES) {
            try {
                const yt = await Innertube.create({
                    cache: new UniversalCache(false),
                    generate_session_locally: true,
                    fetch: {
                        timeout: TIMEOUT
                    }
                });

                const stream = await yt.download(video_id, {
                    type: 'video+audio',
                    quality: 'bestefficiency',
                    format: 'mp4'
                });

                const buffer = await stream2buffer(Utils.streamToIterable(stream));
                if (!buffer || buffer.length === 0) {
                    throw new Error('Empty video buffer received');
                }

                return buffer;
            } catch (error) {
                lastError = error;
                attempts++;
                if (attempts < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        }

        throw lastError;
    } catch (error) {
        console.error('MP4 download error:', error);
        return 'download_failed';
    }
};

// List Message Generator
function GenListMessage(title, options, desc = '', footer = '') {
    if (!title || !Array.isArray(options) || options.length === 0) {
        throw new Error('Invalid parameters for list message');
    }

    let response = `*_${title}_*\n\n`;
    if (desc) response += `${desc}\n\n`;
    
    options.forEach((option, index) => {
        response += `*${index + 1}*. \`\`\`${option}\`\`\`\n`;
    });

    if (footer) response += footer;
    return response;
}

// Enhanced TTS Function
const TTS = async (text, lang) => {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
    }

    try {
        const options = {
            lang: lang || 'en',
            slow: false,
            host: 'https://translate.google.com'
        };

        const audioBase64Array = await googleTTS.getAllAudioBase64(text, options);
        const base64Data = audioBase64Array.map(audio => audio.base64).join('');
        const fileData = Buffer.from(base64Data, 'base64');

        const ttsFile = 'tts.mp3';
        const opusFile = 'tts.opus';

        await fs.writeFile(ttsFile, fileData, { encoding: 'base64' });

        return new Promise((resolve, reject) => {
            ffmpeg(ttsFile)
                .audioCodec('libopus')
                .save(opusFile)
                .on('end', async () => {
                    try {
                        const data = await fs.readFile(opusFile);
                        // Cleanup
                        await Promise.all([
                            fs.unlink(ttsFile),
                            fs.unlink(opusFile)
                        ]);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    } catch (error) {
        console.error('TTS error:', error);
        throw error;
    }
};

// Enhanced Translation Function
const TRT = async (text, lang = 'en') => {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
    }

    try {
        const result = await translate(text, {
            to: lang,
            autoCorrect: true
        });
        return result;
    } catch (error) {
        console.error('Translation error:', error);
        return 'translation_failed';
    }
};

// Enhanced YouTube Info Getter
const getYTInfo = async (url) => {
    try {
        const video_id = getURLVideoID(url);
        const videoInfo = await yts({ videoId: video_id });

        const {
            title,
            description,
            seconds,
            uploaddate,
            views,
            thumbnail,
            author,
            videoId
        } = videoInfo;

        return {
            title,
            description,
            seconds,
            uploaddate,
            views,
            thumbnail,
            author: author.name,
            videoId
        };
    } catch (error) {
        console.error('YouTube info error:', error);
        throw new Error('Failed to get video information');
    }
};

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
