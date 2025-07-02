const {
	Bixby,
	MODE,
	config,
	getJson,
	getBuffer
} = require('../lib')

Bixby({
    pattern: 'ig ?(.*)',
    fromMe: MODE,
    desc: 'Insta Profile Search',
    type: 'stalk',
},
async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('*Give me an Instagram username*');
    const { status, result } = await getJson(
        `${config.BASE_URL}api/stalk/ig?name=${encodeURIComponent(match)}&apikey=${config.INRL_KEY}`
    );

    if (!result || !status) return await message.send(`Please enter a new API key, as the given API key limit has been exceeded. Visit ${config.BASE_URL}api/signup to get a new API key. setvar INRL_KEY: your API key`);
    if (!result.user_info) return await message.send(`User not found`);

    const { full_name, username, profile_pic_url, posts, following, followers, biography, is_private, is_verified } = result.user_info;
    const captionText = `\`\`\`\nusername : ${username}\nname : ${full_name}\nposts : ${posts}\nfollowers : ${followers}\nfollowing : ${following}\nprivate account: ${is_private}\nverified account: ${is_verified}\n\n\nbio : ${biography}\n\`\`\``;

    await message.send(
        await getBuffer(profile_pic_url),
        { caption: captionText, quoted: message.data },
        'image'
    );
});

Bixby({
		pattern: 'ytc ?(.*)',
	        fromMe: MODE,
		desc: 'stalk yt channel',
		type: 'stalk',
	},
	async (message, match) => {
		match = match || message.reply_message.text;
		if (!match)
			return await message.send('*Give me a youtube channel name*')
		const {
			result,
			status
		} = await getJson(
			`${config.BASE_URL}api/stalk/ytchannel?name=${match}&apikey=${config.INRL_KEY}`
		)
		if (!status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
		const {
			name,
			thumbnail,
			verified,
			url,
			subscribers,
			total_video,
			family_safe,
			keywords,
			description
		} = result[0]
		await message.send(
			await getBuffer(thumbnail[0].url), {
				caption: `_*name:* ${name}_\n_*verified:* ${verified}_\n_*url:* ${url}_\n_*subscribers:* ${subscribers}_\n_*videos:* ${total_video} video_\n\n_*description:* ${description||'null'}_\n\n_*keywords:* ${keywords||'null'}_`,
				quoted: message.data
			},
			'image'
		)
	}
)

Bixby({
		pattern: 'git ?(.*)',
	        fromMe: MODE,
		desc: 'stalk git user name',
		type: 'stalk',
	},
	async (message, match) => {
		match = match || message.reply_message.text;
		if (!match)
			return await message.send('*Give me a git user name*\n*Example:*.git inrl-official')
		const {
			result,
			status
		} = await getJson(
			`${config.BASE_URL}api/stalk/github?user=${match}&apikey=${config.INRL_KEY}`
		)
		if (!status) return await message.send(`Please enter a new apikey, as the given apikey limit has been exceeded. Visit ${config.BASE_URL}api/signup for gettig a new apikey. setvar INRL_KEY: your apikey`);
		const {
			login,
			type,
			avatar_url,
			site_admin,
			name,
			company,
			blog,
			location,
			email,
			hireable,
			bio,
			twitter_username,
			public_repos,
			public_gists,
			followers,
			following,
			created_at,
			updated_at
		} = result
		await message.send(
			await getBuffer(avatar_url), {
				caption: `_*name:* ${avatar_url}_\n_*type:* ${type}_\n_*site admin:* ${site_admin}_\n_*name:* ${name}_\n_*company:* ${company}_\n_*email:* ${email}_\n_*hireable:* ${hireable}_\n_*blog:* ${blog||'null'}_\n_*location:* ${location}_\n_*bio:* ${bio}_\n_*twitter username:* ${twitter_username}_\n_*public repos:* ${public_repos}_\n_*public gists:* ${public_gists}_\n_*followers:* ${followers}_\n_*following:* ${following}_\n_*updated at:* ${updated_at}_\n_*created at:* ${created_at}_`,
				quoted: message.data
			},
			'image'
		)
	}
)
