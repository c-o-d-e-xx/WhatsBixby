const {
        Bixby,
        commands,
        sleep,
        linkPreview
} = require("../lib");

const { personalDB } = require("../lib/db");

Bixby({
        pattern: 'toggle ?(.*)',
        fromMe: true,
        desc: 'disable or enable a command',
        type: 'misc',
}, async (message, match) => {
        if (match == 'list') {
                const {toggle} = await personalDB(['toggle'], {content:{}},'get');
                let list = '*LIST OF TOGGLE COMMANDS*'
                if (!Object.keys(toggle)[0]) return await message.send('_Not Found_',{linkPreview: linkPreview()});
                let n = 1;
                for(const t in toggle) {
                        list += `${n++}  ${t}\n`;               
                }
                return await message.reply(list)
        }
        let [cmd, tog] = match.split(' '), isIn = false;
        if (!cmd || (tog != 'off' && tog != 'on')) return await message.send('_invalid method_\n_toggle on|off_', {linkPreview: linkPreview()})
        commands.map((c) => {
                if (c.pattern && c.pattern.replace(/[^a-zA-Z0-9,+-]/g, "") == cmd) {
                        isIn = true
                }
        });
        await sleep(250)
        tog = tog == 'on' ? 'true' : 'false';
        if (!isIn) return await message.send('_no such command to toggle_', {linkPreview: linkPreview()});
        if (cmd == 'toggle') return await message.send('_Do you really want to kill me_', {linkPreview: linkPreview()})
        if(tog == 'false') {
                await personalDB(['toggle'], {content:{[cmd]: tog}},'add');
                return await message.send(`_${cmd} Enabled._`, {linkPreview: linkPreview()})
        } else if(tog == 'true') {
                await personalDB(['toggle'], {content:{id: cmd}},'delete');
                return await message.send(`_${cmd} Disabled._`,{linkPreview: linkPreview()})
        }     

})
