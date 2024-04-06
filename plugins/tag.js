const {
    Module,
    lang,
    addSpace
} = require('../lib');

Module({
    pattern: 'tag ?(.*)',
    desc: 'group tag',
    type: "owner",
    onlyGroup :true,
    fromMe: true
}, async (message, match) => {
    if(!match && !message.reply_message.msg) return;
    const groupMetadata = await message.client.groupMetadata(message.from).catch(e => {})
    const participants = await groupMetadata.participants
    let admins = await participants.filter(v => v.admin !== null).map(v => v.id)
    if(match=="all"){
    let msg = "",
        ext;
    let count = 1;
    for (let mem of participants) {
        msg += `${addSpace(count++, 1)} : @${mem.id.split('@')[0]}\n`
    }
    return await message.send('```'+msg+'```',
        {mentions: participants.map(a => a.id)});
    } else if (match=="admin" || match=="admins") {
    let msg = "";
    let count = 1;
    for (let mem of admins) {
        msg += `${addSpace(count++, 1)} : @${mem.split('@')[0]}\n`
    }
    return await await message.send('```'+msg+'```',{mentions: participants.map(a => a.id)});
    } else if(match == "me" || match == "mee") {
           return await message.send(`@${message.user.number}`, {mentions: [message.user.jid]});
} else if(match || message.reply_message.text){
        match =  message.reply_message.text||match;
    if (!match) return await message.reply(lang.BASE.TEXT);
    await message.send(match,{mentions: participants.map((a) => a.id)});
   } else if(message.reply_message.i) {
          return await message.forwardMessage(message.jid, message.reply_message, {contextInfo: {mentionedJid: participants.map(a => a.id)}});
  }
});
