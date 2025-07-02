const {
        Bixby,
        MODE,
        config,
        getJson
} = require("../lib");

Bixby({
        pattern: 'reddit',
        type: "search",
        fromMe: MODE,
        desc: "searches and get data from reddit",
}, async (message, match) => {
                match = match || message.reply_message.text;
                if (!match) return await message.send("*please give me an text!*");
                const data = await getJson(`${config.BASE_URL}api/search/reddit?query=${match}&apikey=${config.INRL_KEY}`);
                if(!data.status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`); 
                let msg ="*_→RESULT FROM REDDIT←_*\n\n";
                data.result.map(({title, image, link, nsfw,voteRatio,like,author, dislike,comment,subredditName})=>{
                msg += `_• title: ${title}_
_• image: ${image}_
_• link: ${link}_
_• isNSFW: ${nsfw}_
_• votes in ratio: ${voteRatio}_
_• author: ${author}_
_• like: ${like}_
_• dislike: ${dislike}_
_• comment: ${comment}_
_• subredditName: ${subredditName}_

`
});
                return await message.send(msg);
});
