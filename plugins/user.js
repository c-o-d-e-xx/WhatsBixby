const {
    Module,
    getVar,
    commands,
    sleep,
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
      


Module({
        pattern: 'toggle ?(.*)',
        fromMe: true,
        desc: 'command freezer',
        type: 'misc',
}, async (message, match) => {
        if (match == 'list') {
                const {toggle} = await getVar(['toggle'], {content:{}},'get');
                let list = lang.TOGGLE.LIST
                if (!Object.keys(toggle)[0]) return await message.reply('_Not Found_');
                let n = 1;
                for(const t in toggle) {
                        list += `${n++}  ${t}\n`;               
                }
                return await message.reply(list)
        }
        let [cmd, tog] = match.split(' '), isIn = false;
        if (!cmd || (tog != 'off' && tog != 'on')) return await message.reply(lang.TOGGLE.METHODE.format("toggle"))
        commands.map((c) => {
                if (c.pattern && c.pattern.replace(/[^a-zA-Z0-9,+-]/g, "") == cmd) {
                        isIn = true
                }
        });
        await sleep(250)
        tog = tog == 'on' ? 'true' : 'false';
        if (!isIn) return await message.reply(lang.TOGGLE.ERROR);
        if (cmd == 'toggle') return await message.reply(lang.TOGGLE.ERROR_KILL)
        if(tog == 'false') {
                await getVar(['toggle'], {content:{[cmd]: tog}},'add');
                return await message.reply(`_${cmd} Enabled._`)
        } else if(tog == 'true') {
                await getVar(['toggle'], {content:{id: cmd}},'delete');
                return await message.reply(`_${cmd} Disabled._`)
        }     

})
