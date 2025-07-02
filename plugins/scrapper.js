const {
    Bixby,
    MODE,
    weather,
    ringtone,
    GenListMessage,
    getJson,
    config
} = require('../lib');


Bixby({
    pattern: 'google',
    fromMe: MODE,
    desc: 'search on Google',
    react: "🙃",
    type: "search"
}, async (message, match) => {
    if (!match) return message.send('_give me some query_');
    const { result, status } = await getJson(`${config.BASE_URL}api/search/pinterest?text=${match}&apikey=${config.INRL_KEY}`);
    if (!status) return await message.send(`API key limit exceeded. Get a new API key at ${config.BASE_URL}api/signup. Set var INRL_KEY: your_api_key`);
    await Promise.all(result.map(async (item) => {
        await message.send(`*Title:* ${item.title}\n*Link:* ${item.link}\n*Snippet:* ${item.snippet}\n`);
    }));
});

Bixby({
    pattern: 'ringtone',
    fromMe: MODE,
    desc: 'download ringtone',
    react : "🙃",
    type: "search"
}, async (message, match) => {
        if (!match) return message.send('_give me some query_');
        let result = await ringtone(match), res=[];
        await result.map(r=>res.push(r.title));
        return await message.send(GenListMessage('LIST OF RINGTONES', res));
});
