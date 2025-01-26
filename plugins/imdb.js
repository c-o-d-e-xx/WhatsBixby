/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const { Bixby, isPrivate, getBuffer } = require("../lib/");

async function fetcher(apiUrl, message, m) {
    try {
        console.log(apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        let mess = `Title: ${data.Title}\nYear: ${data.Year}\nRated: ${data.Rated}\nReleased: ${data.Released}\nRuntime: ${data.Runtime}\nGenre: ${data.Genre}\nDirector: ${data.Director}\nActors: ${data.Actors}\nPlot: ${data.Plot}\nLanguage: ${data.Language}\nCountry: ${data.Country}\nAwards: ${data.Awards}\nRatings: ${data.Ratings.map(rating => `${rating.Source}: ${rating.Value}`).join(', ')}\nBoxOffice: ${data.BoxOffice}`;


        return await message.client.sendMessage(message.jid,
            { text: mess,
            contextInfo:{
            externalAdReply: {
                title: `Codex`,
                body: `codex`,
                previewType: "PHOTO",
                thumbnailUrl: ``,
                thumbnail: await getBuffer(data.Poster),
                sourceUrl: `github.com/c-o-d-e-xx`}
            }
        })


    } catch (error) {
        console.error('Error:', error);
    }
}

Bixby(
    {
        pattern: "imdb",
        fromMe: isPrivate,
        desc: "imdb movie info",
        type: "tool",
    },
    async (message, match, m) => {
        const apiUrl = `https://www.omdbapi.com/?apikey=3c8ee796&t=${await match}`;
        return fetcher(apiUrl, message, m);
    }
);
