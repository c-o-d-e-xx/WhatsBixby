const {
    Module,
    getVar,
    lang
} = require("../lib")

Module({
    pattern: 'setcmd',
    desc: lang.MEDIA_CMD.SET_DESC,
    type: "action",
    fromMe :true,
    media: "sticker"//you can get this type of active action from 'eval'=>() return lib.commands[0]
}, async (message, match) => {
    if (!message.reply_message.msg?.fileSha256) return message.send(lang.MEDIA_CMD.CMD_ERROR)
    if (!match) return await message.send(lang.MEDIA_CMD.NO_CMD)
    await getVar(['sticker_cmd'], {content:{[match]: message.reply_message.msg.fileSha256.join("")}},'add');
    return await message.reply(lang.BASE.SUCCESS)
});
Module({
    pattern: 'dltcmd',
    desc: lang.MEDIA_CMD.DEL_DESC,
    type: "action",
    fromMe :true
}, async (message, match) => {
    if (!match) return await message.send(lang.MEDIA_CMD.NO_CMD)
    await getVar(['sticker_cmd'], {content:{id: match}},'delete');
    return await message.reply(lang.BASE.SUCCESS)
});
Module({
    pattern: 'getcmd',
    desc: lang.MEDIA_CMD.GET_DESC,
    type: "action",
    fromMe :true
}, async (message, match) => {
    const {sticker_cmd} = await getVar(['sticker_cmd'], {content:{}},'get');
    if(!Object.keys(sticker_cmd)[0]) return await message.send(lang.MEDIA_CMD.NOT_FOUND);
    let cmds = lang.MEDIA_CMD.CMD_LIST+'\n\n';
    let n = 1;
    for(const cmd in sticker_cmd) {
        cmds += '```'+`${n++}  ${cmd}`+'```'+`\n`
    };
    return await message.reply(cmds)
});
      
