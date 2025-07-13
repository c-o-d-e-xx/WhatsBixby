/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Crypto = require("crypto");
const { PREFIX, WORKTYPE, LINK_PREVIEW, BOT_INFO } = require("../config");
const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");
const FormData = require("form-data");
const ID3Writer = require("browser-id3-writer");
const { getRandom, getBuffer, fetchJson, runtime, sleep, isUrl, bytesToSize, getSizeMedia, check } = require("i-nrl");
const { commands } = require("./events");


async function isAdmin(m) {
	if (!m.isGroup) return false;
	const metadata = await m.client.groupMetadata(m.from).catch(() => ({}));
	const admins = metadata?.participants?.filter(v => v.admin)?.map(v => v.id) || [];
	return admins.includes(m.sender);
}

async function isBotAdmin(m) {
	if (!m.isGroup) return false;
	const metadata = await m.client.groupMetadata(m.from).catch(() => ({}));
	const admins = metadata?.participants?.filter(v => v.admin)?.map(v => v.id) || [];
	return admins.includes(m.user.jid);
}

function getCompo(digit) {
		if (!digit.includes("x")) return false
		let num = digit.replace(/[0-9]/g, '');
		if (num.length > 3) return false
		if (num.length === 3) {
			let chart = ["000", "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015", "016", "017", "018", "019", "020", "021", "022", "023", "024", "025", "026", "027", "028", "029", "030", "031", "032", "033", "034", "035", "036", "037", "038", "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049", "050", "051", "052", "053", "054", "055", "056", "057", "058", "059", "060", "061", "062", "063", "064", "065", "066", "067", "068", "069", "070", "071", "072", "073", "074", "075", "076", "077", "078", "079", "080", "081", "082", "083", "084", "085", "086", "087", "088", "089", "090", "091", "092", "093", "094", "095", "096", "097", "098", "099", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255", "256", "257", "258", "259", "260", "261", "262", "263", "264", "265", "266", "267", "268", "269", "270", "271", "272", "273", "274", "275", "276", "277", "278", "279", "280", "281", "282", "283", "284", "285", "286", "287", "288", "289", "290", "291", "292", "293", "294", "295", "296", "297", "298", "299", "300", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "347", "348", "349", "350", "351", "352", "353", "354", "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398", "399", "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "421", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455", "456", "457", "458", "459", "460", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470", "471", "472", "473", "474", "475", "476", "477", "478", "479", "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "490", "491", "492", "493", "494", "495", "496", "497", "498", "499", "500", "501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518", "519", "520", "521", "522", "523", "524", "525", "526", "527", "528", "529", "530", "531", "532", "533", "534", "535", "536", "537", "538", "539", "540", "541", "542", "543", "544", "545", "546", "547", "548", "549", "550", "551", "552", "553", "554", "555", "556", "557", "558", "559", "560", "561", "562", "563", "564", "565", "566", "567", "568", "569", "570", "571", "572", "573", "574", "575", "576", "577", "578", "579", "580", "581", "582", "583", "584", "585", "586", "587", "588", "589", "590", "591", "592", "593", "594", "595", "596", "597", "598", "599", "600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "620", "621", "622", "623", "624", "625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638", "639", "640", "641", "642", "643", "644", "645", "646", "647", "648", "649", "650", "651", "652", "653", "654", "655", "656", "657", "658", "659", "660", "661", "662", "663", "664", "665", "666", "667", "668", "669", "670", "671", "672", "673", "674", "675", "676", "677", "678", "679", "680", "681", "682", "683", "684", "685", "686", "687", "688", "689", "690", "691", "692", "693", "694", "695", "696", "697", "698", "699", "700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "750", "751", "752", "753", "754", "755", "756", "757", "758", "759", "760", "761", "762", "763", "764", "765", "766", "767", "768", "769", "770", "771", "772", "773", "774", "775", "776", "777", "778", "779", "780", "781", "782", "783", "784", "785", "786", "787", "788", "789", "790", "791", "792", "793", "794", "795", "796", "797", "798", "799", "800", "801", "802", "803", "804", "805", "806", "807", "808", "809", "810", "811", "812", "813", "814", "815", "816", "817", "818", "819", "820", "821", "822", "823", "824", "825", "826", "827", "828", "829", "830", "831", "832", "833", "834", "835", "836", "837", "838", "839", "840", "841", "842", "843", "844", "845", "846", "847", "848", "849", "850", "851", "852", "853", "854", "855", "856", "857", "858", "859", "860", "861", "862", "863", "864", "865", "866", "867", "868", "869", "870", "871", "872", "873", "874", "875", "876", "877", "878", "879", "880", "881", "882", "883", "884", "885", "886", "887", "888", "889", "890", "891", "892", "893", "894", "895", "896", "897", "898", "899", "900", "901", "902", "903", "904", "905", "906", "907", "908", "909", "910", "911", "912", "913", "914", "915", "916", "917", "918", "919", "920", "921", "922", "923", "924", "925", "926", "927", "928", "929", "930", "931", "932", "933", "934", "935", "936", "937", "938", "939", "940", "941", "942", "943", "944", "945", "946", "947", "948", "949", "950", "951", "952", "953", "954", "955", "956", "957", "958", "959", "960", "961", "962", "963", "964", "965", "966", "967", "968", "969", "970", "971", "972", "973", "974", "975", "976", "977", "978", "979", "980", "981", "982", "983", "984", "985", "986", "987", "988", "989", "990", "991", "992", "993", "994", "995", "996", "997", "998", "999"]
			let number = []
			chart.map((n) => {
				number.push(digit.replaceAll(num, n))
			})
			return number
		} else if (num.length === 2) {
			let chart = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"]
			let number = []
			chart.map((n) => {
				number.push(digit.replaceAll(num, n))
			})
			return number
		} else if (num.length === 1) {
			let chart = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
			let number = []
			chart.map((n) => {
				number.push(digit.replaceAll(num, n))
			})
			return number
		}
	}

function getDate() {
	return new Date().toLocaleDateString("EN", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function parsedJid(text) {
	return text.match(/[0-9]+(-[0-9]+|)(@g.us|@s.whatsapp.net)/g);
}

const MODE = (!WORKTYPE || WORKTYPE.toLowerCase().trim() !== 'public');
const PREFIX = (!PREFIX || PREFIX === 'false' || PREFIX === 'null') ? "" : (PREFIX.includes('[') && PREFIX.includes(']')) ? PREFIX[2] : PREFIX.trim();

function extractUrlsFromString(text) {
	if (!text) return false;
	const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
	return text.match(regexp) || false;
}

async function getJson(url, options) {
	try {
		const res = await axios({
			method: "GET",
			url,
			headers: {
				"User-Agent": "Mozilla/5.0"
			},
			...options,
		});
		return res.data;
	} catch (err) {
		return err;
	}
}

const isIgUrl = url => /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/gim.test(url);

const getUrl = url => url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);

function isNumber(num) {
	const int = parseInt(num);
	return typeof int === "number" && !isNaN(int);
}

function MediaUrls(text) {
	if (!text) return false;
	const urls = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi);
	if (!urls) return false;
	return urls.filter(url => ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp'].includes(url.split('.').pop().toLowerCase()));
}

function isInstagramURL(url) {
	return /^https?:\/\/(www\.)?instagram\.com\/.*/i.test(url);
}

function linkPreview(options = {}) {
	if (!LINK_PREVIEW || LINK_PREVIEW.toLowerCase() === 'false' || LINK_PREVIEW.toLowerCase() === 'null') return undefined;
	const [title, body, thumb, source] = LINK_PREVIEW.split(/[;,|]/);
	return {
		showAdAttribution: true,
		title: options.title || title || 'INRL-MD',
		body: options.body || body,
		mediaType: 1,
		thumbnailUrl: options.url || thumb || 'https://i.imgur.com/qyvmAzS.jpeg',
		sourceUrl: source || 'https://whatsapp.com/channel/0029VaAKCMO1noz22UaRdB1Q'
	};
}

const format = function(code) {
	let i = -1;
	let byt = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	do {
		code /= 1024;
		i++
	} while (code > 1024);
	return Math.max(code, 0.1).toFixed(1) + byt[i]
}

async function uploadImageToImgur(imagePath) {
	try {
		const data = new FormData();
		data.append('image', fs.createReadStream(imagePath));
		const headers = {
			'Authorization': `Client-ID 3ca8036b07e0f25`,
			...data.getHeaders()
		};
		const response = await axios.post('https://api.imgur.com/3/upload', data, { headers });
		return response?.data?.data?.link;
	} catch {
		return `invalid location get:bad-get`;
	}
}

async function AudioMetaData(audio, info = {}) {
	let title = info.title || "INRL-BOT";
	let body = info.body ? [info.body] : [];
	let img = info.image || 'https://i.imgur.com/DyLAuEh.jpg';
	if (!Buffer.isBuffer(img)) img = await getBuffer(img);
	if (!Buffer.isBuffer(audio)) audio = await getBuffer(audio);
	const writer = new ID3Writer(audio);
	writer
		.setFrame("TIT2", title)
		.setFrame("TPE1", body)
		.setFrame("APIC", {
			type: 3,
			data: img,
			description: "INRL-BOT-MD",
		});
	writer.addTag();
	return Buffer.from(writer.arrayBuffer);
}

function addSpace(text, length = 3, align = "left") {
	text = text.toString();
	if (text.length >= length) return text;
	const space = " ";
	if (align !== "left" && align !== "right") {
		const even = length - (text.length % 2 !== 0 ? 1 : 0);
		while (text.length < even) text = space + text + space;
		return text;
	}
	while (text.length < length) {
		text = align === "left" ? text + space : space + text;
	}
	return text;
}

async function sendUrl(message) {
if(message.reply_message.sticker) {
	const imageBuffer = await message.reply_message.download();
	const form = new FormData();
	form.append('image', imageBuffer, 'bt.jpg');
	form.append('key', api);
	const response = await axios.post('https://api.imgbb.com/1/upload', form, {
		headers: form.getHeaders()
	}).catch(e=>e.response);
	return await message.send(response.data.data.image.url);
	} else if (message.reply_message.image || message.image) {
	const msg = message.reply_message.image || message.image;
		const url = await uploadImageToImgur(await message.client.downloadAndSaveMediaMessage(msg))
		return await message.send(url);
	} else if (message.reply_message.video || message.video) {
	const msg = message.reply_message.video || message.video
		const url = await uploadImageToImgur(await message.client.downloadAndSaveMediaMessage(msg))
		return await message.send(url);
	} else if (message.reply_message.audio) {
	const msg = message.reply_message.audio;
		let urvideo = await message.client.downloadAndSaveMediaMessage(msg)
		await ffmpeg(urvideo)
			.outputOptions(["-y", "-filter_complex", "[0:a]showvolume=f=1:b=4:w=720:h=68,format=yuv420p[vid]", "-map", "[vid]", "-map 0:a"])
			.save('output.mp4')
			.on('end', async () => {
				const url = await uploadImageToImgur('./output.mp4')
				return await message.send(url);
			});
	}
}

async function send_menu(m) {
	const image = MediaUrls(BOT_INFO)
		if (image) {
			img_url = image[0];
			theam = img_url.video ? 'video' : 'image';
			BOT_INFO = BOT_INFO.replace(img_url[theam], '').trim();
		}
	const info_vars = BOT_INFO.split(/[;,|]/);
	let date = new Date().toLocaleDateString("EN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	let types = {};
  let menu = `*Owner: ${(info_vars[0] || info_vars || '').replace(/[;,|]/g,'')}*
*User: @${m.number}*
*Plugins: ${commands.length.toString()}*
*Prefix: ${PREFIX}*
*Date: ${date}*
*Mode: ${WORKTYPE}*
*Version: ${require('../package.json').version}*
*Ram: ${format(os.totalmem()-os.freemem())}*\n\n`;

	commands.map((command) => {
		if (command.pattern) {
			const type = command.type.toLowerCase()
      if(!types[type]) types[type] = [];
       types[type].push(command.pattern)
		}
	});
  const cmd_list = Object.keys(types)
	cmd_list.forEach((cmmd) => {
		menu += `⭓ ${addSpace('*'+cmmd.toUpperCase()+'*',14,"both")} ⭓`;
      types[cmmd].map(a=>{
			menu += `\n• _${a.replace(/[^a-zA-Z0-9-+]/g,'')}_`;
		});
		menu += `\n\n${String.fromCharCode(8206).repeat(4001)}`;
	});
  const options = {
    contextInfo: {
	mentionedJid: [m.sender]
    }
  }
  if(LINK_PREVIEW && LINK_PREVIEW.toLowerCase()!= 'null' && LINK_PREVIEW.toLowerCase()!= 'false'){
    options.contextInfo.externalAdReply = {}
    const image = MediaUrls(LINK_PREVIEW)
    if(image[0]){
      LINK_PREVIEW = LINK_PREVIEW.replace(image[0])
      options.contextInfo.externalAdReply.thumbnailUrl = image[0]
    }
  options.contextInfo.externalAdReply.title = LINK_PREVIEW.split(/[,;|]/)[0];
  options.contextInfo.externalAdReply.body = LINK_PREVIEW.split(/[,;|]/)[1];
  options.contextInfo.externalAdReply.sourceUrl = extractUrlsFromString(LINK_PREVIEW)[0]
  }
	if (theam == 'text') {
		return await m.client.sendMessage(m.jid, {
			text: menu,
			...options
		});
	} else {
		return await m.client.sendMessage(m.from, {
			[theam]: {
				url: img_url
			},
			caption: menu,
			...options
		});
	}
}

async function send_alive(m, ALIVE_DATA,obj) {
	const sstart = new Date().getTime();
	let msg = {
		contextInfo: {}
	}
	const prefix = obj.PREFIX == "false" ? '' : obj.PREFIX;
	let extractions = ALIVE_DATA.match(/#(.*?)#/g);
	let URLS;
	if (extractions) {
		ALIVE_DATA = ALIVE_DATA.replace(/#([^#]+)#/g, '');
		extractions = extractions.map(m => m.slice(1, -1));
		let arra = [];
		URLS = MediaUrls(ALIVE_DATA);
		msg.contextInfo.externalAdReply = {
			containsAutoReply: true,
			mediaType: 1,
			previewType: "PHOTO"
		};
		extractions.map(extraction => {
			extraction = extraction.replace('\\', '');
			if (extraction.match(/adattribution/gi)) msg.contextInfo.externalAdReply.showAdAttribution = true;
			if (extraction.match(/adreply/gi)) msg.contextInfo.externalAdReply.showAdAttribution = true;
			if (extraction.match(/largerthumbnail/gi)) msg.contextInfo.externalAdReply.renderLargerThumbnail = true;
			if (extraction.match(/largethumb/gi)) msg.contextInfo.externalAdReply.renderLargerThumbnail = true;
			if (extraction.match(/title/gi)) msg.contextInfo.externalAdReply.title = extraction.replace(/title/gi, '');
			if (extraction.match(/body/gi)) msg.contextInfo.externalAdReply.body = extraction.replace(/body/gi, '');
			if (extraction.match(/thumbnail/gi) && !extraction.match(/largerthumbnail/gi)) msg.contextInfo.externalAdReply.thumbnailUrl = extraction.replace(/thumbnail/gi, '');
			if (extraction.match(/thumb/gi) && !extraction.match(/largerthumbnail/gi) && !extraction.match(/largethumb/gi) && !extraction.match(/thumbnail/gi)) msg.contextInfo.externalAdReply.thumbnailUrl = extraction.replace(/thumb/gi, '');
			if (extraction.match(/sourceurl/gi)) msg.contextInfo.externalAdReply.sourceUrl = extraction.replace(/sourceurl/gi, '');
			if (extraction.match(/mediaurl/gi)) msg.contextInfo.externalAdReply.mediaUrl = extraction.replace(/mediaurl/gi, '');
		});
	} else {
		URLS = MediaUrls(ALIVE_DATA);
	}
	let date = new Date().toLocaleDateString("EN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const URL = URLS[Math.floor(Math.random() * URLS.length)];
	const platform = os.platform();
	const sender = m.sender;
	const user = m.pushName;
	let text = ALIVE_DATA.replace(/&ram/gi, format(os.totalmem() - os.freemem())).replace(/&sender/gi, `@${sender.replace(/[^0-9]/g,'')}`).replace(/&user/gi, `${user}`).replace(/&version/gi, `${package.version}`).replace(/&prefix/gi, `${prefix}`).replace(/&mode/gi, `${obj.WORKTYPE}`).replace(/&platform/gi, `${platform}`).replace(/&date/gi, `${date}`).replace(/&speed/gi, `${sstart-new Date().getTime()}`).replace(/&gif/g, '');
	if (ALIVE_DATA.includes('&sender')) msg.contextInfo.mentionedJid = [sender];
	if (ALIVE_DATA.includes('&gif')) msg.gifPlayback = true;
	if (URL && URL.endsWith('.mp4')) {
		msg.video = {
				url: URL
			},
			msg.caption = URLS.map(url => text = text.replace(url, ''));

	} else if (URL) {
		msg.image = {
				url: URL
			},
			msg.caption = URLS.map(url => text = text.replace(url, ''));

	} else msg.text = text.trim();
	return await m.client.sendMessage(m.jid, msg);
}

async function poll(id) {
	if (!fs.existsSync('./lib/database/poll.json')) return {
		status: false
	}
	const file = JSON.parse(fs.readFileSync('./lib/database/poll.json'));
	const poll_res = file.message.filter(a => id.key.id == Object.keys(a)[0]);
	if (!poll_res[0]) return {
		status: false
	}
	let options = {}
	const vote_id = Object.keys(poll_res[0]);
	const vote_obj = Object.keys(poll_res[0][vote_id].votes);
	let total_votes = 0;
	vote_obj.map(a => {
		options[a] = {
			count: poll_res[0][vote_id].votes[a].length
		};
		total_votes = total_votes + poll_res[0][vote_id].votes[a].length
	});
	const keys = Object.keys(options);
	keys.map(a => options[a].percentage = (options[a].count / total_votes) * 100 + '%');
	return {
		status: true,
		res: options,
		total: total_votes
	}
}

module.exports = {
	isAdmin,
	isBotAdmin,
	getCompo,
	getDate,
	parsedJid,
	PREFIX,
	MODE,
	extractUrlsFromString,
	getJson,
	isIgUrl,
	getUrl,
	isNumber,
	MediaUrls,
	isInstagramURL,
	linkPreview,
	format,
	uploadImageToImgur,
	AudioMetaData,
	addSpace,
	sendUrl,
	send_menu,
	send_alive,
	poll,
	getRandom,
	getBuffer,
	fetchJson,
	runtime,
	sleep,
	isUrl,
	bytesToSize,
	getSizeMedia,
	check
};