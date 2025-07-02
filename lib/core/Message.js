/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {
	generateWAMessageContent,
	extractMessageContent,
	jidNormalizedUser,
	getContentType,
	normalizeMessageContent,
	proto,
	delay,
	downloadContentFromMessage,
	getBinaryNodeChild,
	WAMediaUpload,
	generateForwardMessageContent,
	downloadMediaMessage,
	generateWAMessageFromContent,
	getBinaryNodeChildren,
	areJidsSameUser,
	generateWAMessage,
	jidDecode,
	WA_DEFAULT_EPHEMERAL
} = require("baileys");
const fs = require("fs");
const FileType = require("file-type");
const path = require("path");
const PhoneNumber = require("awesome-phonenumber")
const {getBuffer} = require("i-nrl");
const {toAudio,toPTT} = require("../functions");
const Config = require("../../config");
const {
	fromBuffer
} = require("file-type")
const {
	imageToWebp,
	videoToWebp,
	writeExifImg,
	writeExifVid,
	writeExifWebp
} = require("../sticker");
const Jimp = require("jimp");
const util = require("util");
const M = proto.WebMessageInfo;

async function changeprofile(img) {
	const {
		read,
		MIME_JPEG
	} = require("jimp")
	const jimp = await read(img)
	const min = Math.min(jimp.getWidth(), jimp.getHeight())
	const cropped = jimp.crop(0, 0, jimp.getWidth(), jimp.getHeight())
	let width = jimp.getWidth(),
		hight = jimp.getHeight(),
		ratio;
	if (width > hight) {
		ratio = jimp.getWidth() / 720
	} else {
		ratio = jimp.getWidth() / 324
	};
	width = width / ratio;
	hight = hight / ratio;
	img = cropped.quality(100).resize(width, hight).getBufferAsync(MIME_JPEG);
	return {
		img: await img
	}
}
async function sendInvaite(jid, conn, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
	const msg = proto.Message.fromObject({
		groupInviteMessage: proto.Message.GroupInviteMessage.fromObject({
			inviteCode,
			inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date + (3 * 86400000)),
			groupJid: jid,
			groupName: groupName,
			jpegThumbnail: null,
			caption
		})
	})
	const message = generateWAMessageFromContent(participant, msg, options)
	await conn.relayMessage(participant, message.message, {
		messageId: message.key.id
	})
	return message
};
// #################################################################################################
class WAConnection {
	constructor(conn) {
		for (let v in conn) this[v] = conn[v];
	}
	async serializeM(m) {
		return exports.serialize(this, m);
	}
	async copyNForward(jid, message, forceForward = false, options = {}) {
		let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}
		let mtype = Object.keys(message.message)[0]
		let content = await generateForwardMessageContent(message, forceForward)
		let ctype = Object.keys(content)[0]
		let context = {}
		if (mtype != "conversation") context = message.message[mtype].contextInfo
		content[ctype].contextInfo = {
			...context,
			...content[ctype].contextInfo
		}
		const waMessage = await generateWAMessageFromContent(jid, content, options ? {
			...content[ctype],
			...options,
			...(options.contextInfo ? {
				contextInfo: {
					...content[ctype].contextInfo,
					...options.contextInfo
				}
			} : {})
		} : {})
		await conn.relayMessage(jid, waMessage.message, {
			messageId: waMessage.key.id
		})
		return waMessage
	}
	cMod(jid, copy, text = '', sender = conn.user.id, options = {}) {
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
		if (isEphemeral) {
			mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
		}
		let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
		if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
		}
		if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === conn.user.id
		return proto.WebMessageInfo.fromObject(copy)
	}
	async appenTextMessage(jid, text, chatUpdate, key, voter) {
		let messages = await generateWAMessage(jid, {
			text
		}, {
			userJid: conn.user.id,
		})
		messages.key.fromMe = areJidsSameUser(voter, conn.user.id)
		messages.key.id = key.key.id;
		messages.pushName = key.pushName;
		messages.key.participant = voter;
		const msg = {
			...chatUpdate,
			messages: [proto.WebMessageInfo.fromObject(messages)],
			type: 'append'
		}
		return msg;
	}
	decodeJid(jid) {
		if (!jid) return jid
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {}
			return decode.user && decode.server && decode.user + '@' + decode.server || jid
		} else return jid
	}

	parseMention(text) {
		return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
			(v) => v[1] + "@s.whatsapp.net");
	}
	async save(m) {
		const type = getContentType(m.message);
		const mime = m.message[type].mimetype;
		const buffer = await downloadMediaMessage(
			m,
			'buffer', {}, {
				reuploadRequest: this.updateMediaMessage
			}
		)
		return {
			buff: buffer,
			type: type.replace('Message', ''),
			mime
		}
	}
	async downloadMediaMessage(message) {
		message = message?.msg ? message?.msg : message;
		let mimetype = (message.msg || message).mimetype || "";
		let mtype = message.type ? message.type.replace(/Message/gi, "") : mimetype.split("/")[0];
		const stream = await downloadContentFromMessage(message, mtype);
		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		return buffer;
	}
	async resize(image, width, height) {
		let read = await Jimp.read(image)
		let afcutt = await read.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
		return afcutt
	}
	async downloadAndSaveMediaMessage(message, filename, attachExtension = true) {
		let quoted = message.msg ? message.msg : message;
		let mime = (message.msg || message).mimetype || "";
		let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
		const stream = await downloadContentFromMessage(quoted, messageType);
		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		let type = await FileType.fromBuffer(buffer);
		let trueFileName = attachExtension ? filename + "." + type.ext : filename;
		// save to file
		await fs.writeFileSync(trueFileName, buffer);
		return trueFileName;
	}
	async getFile(PATH, save) {
		let filename;
		let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], "base64") : /^https?:\/\//.test(PATH) ? await getBuffer(PATH) : fs.existsSync(PATH) ? ((filename = PATH), fs.readFileSync(PATH)) : typeof PATH === "string" ? PATH : Buffer.alloc(0);
		let type = (await FileType.fromBuffer(data)) || {
			mime: "application/octet-stream",
			ext: ".bin",
		};
		filename = path.join(__dirname, "../../media" + new Date() * 1 + "." + type.ext);
		if (data && save) fs.promises.writeFile(filename, data);
		return {
			filename,
			size: await Buffer.byteLength(data),
			...type,
			data,
		};
	}
	async sendFile(jid, PATH, fileName, quoted = {}, options = {}) {
		let types = await this.getFile(PATH, true);
		let {
			filename,
			size,
			ext,
			mime,
			data
		} = types;
		let type = "",
			mimetype = mime,
			pathFile = filename;
		if (options.asDocument) type = "document";
		if (options.asSticker || /webp/.test(mime)) {
			let media = {
				mimetype: mime,
				data
			};
			pathFile = await writeExif(media, {
				packname: options.packname ? options.packname : " ",
				author: options.author ? options.author : " ",
				categories: options.categories ? options.categories : [],
			});
			type = "sticker";
			mimetype = "image/webp";
		} else if (/image/.test(mime)) type = "image";
		else if (/video/.test(mime)) type = "video";
		else if (/audio/.test(mime)) type = "audio";
		else type = "document";
		await this.sendMessage(jid, {
			[type]: {
				url: pathFile
			},
			mimetype,
			fileName,
			...options
		}, {
			quoted,
			...options
		});
	}
	async sendReact(jid, imog = "", key) {
		return await this.sendMessage(jid, {
			react: {
				text: imog,
				key: key
			}
		});
	}
}
class serialize {
	constructor(conn, m, createrS, store) {
		if (!m) return m;
		m = M.fromObject(m);
		for (let i in m) this[i] = m[i];
		this.sudo = createrS;
                Object.defineProperty(this, "store", { value: store });
		Object.defineProperty(this, "client", { value: conn });
		Object.defineProperty(this, "m", { value: m });
		this.owners = [jidNormalizedUser(this.client.user.id), "917593919575@s.whatsapp.net"].concat(this.sudo);
		this.team = this.owners.filter(x => !!x)
		this.admins = this.team.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
		this.type = getContentType(this.message);
		if(this[this.type] == 'reactionMessage') {
		   this.reaction = {
		       reaction: true,
		       text: this.message[this.type].text
		   }
		this.message[this.type].text = null;
		}
		this.body = this.text = this.message?.conversation ||  this.message?.[this.type]?.text || this.message?.[this.type]?.caption || this.message?.[this.type]?.contentText || this.message?.[this.type]?.selectedDisplayText || this.message?.[this.type]?.title || "";
		this.data = {
			key: this.key,
			message: this.message
		};
		this._key(conn);
		this._message(conn);
		this._client(conn, createrS);
	}
	_key(conn) {
		if (this.key) {
			this.from = this.jid = this.chat = jidNormalizedUser(this.key.remoteJid || this.key.participant);
			this.fromMe = this.key.fromMe;
			this.id = this.key.id;
			this.isBot = this.id == undefined || null ? 'false' : this.id.startsWith("BAE5") && this.id.length == 16;
			this.isGroup = this.from.endsWith("@g.us");
			this.sender = jidNormalizedUser(
				(this.fromMe && conn.user?.id) || this.key.participant || this.from || "");
		}
	}
	_message(conn) {
		if (this.message) {
			this.message = extractMessageContent(this.message);
			this.msg = this.message[this.type];
			const reply_message = this.msg?.contextInfo ? this.msg?.contextInfo?.quotedMessage : null;
			if (reply_message) {
			this.reply_message = {};
				this.reply_message.i = true;
				this.reply_message.message = reply_message;
				this.reply_message.image = reply_message.imageMessage ? reply_message.imageMessage : false;
				this.reply_message.video = reply_message.videoMessage ? reply_message.videoMessage : false;
				this.reply_message.location = reply_message.locationMessage ? reply_message.locationMessage : false;
				this.reply_message.sticker = reply_message.stickerMessage ? reply_message.stickerMessage : false;
				this.reply_message.audio = reply_message.audioMessage ? reply_message.audioMessage : false;
				this.reply_message.contact = reply_message.contactMessage ? reply_message.contactMessage : false;
				this.reply_message.document = reply_message.documentMessage ? reply_message.documentMessage : false;
				this.reply_message.type = getContentType(reply_message);
				this.reply_message.msg = reply_message[this.reply_message.type];
				this.reply_message.id = this.msg?.contextInfo?.stanzaId;
				this.reply_message.sender = jidNormalizedUser(this.msg?.contextInfo?.participant);
				this.reply_message.from = this.from;
				this.reply_message.mention = new Object();
				this.reply_message.mention.jid = reply_message?.msg?.extendedTextMessage?.contextInfo?.mentionedJid || this.reply_message?.msg?.contextInfo?.mentionedJid || [];
				this.reply_message.mention.isBotNumber = this.reply_message.mention.jid.includes(conn.botNumber);
				this.reply_message.mention.isOwner = (this.admins.map((v) => this.reply_message.mention.jid.includes(v))).includes(true);
				this.reply_message.isBot = this.reply_message.id ? this.reply_message?.id?.startsWith("BAE5") && this.reply_message?.id == 16 : 'false';
				this.reply_message.fromMe = this.reply_message?.sender == jidNormalizedUser(conn.user && conn.user?.id);
				this.reply_message.text = reply_message?.extendedTextMessage?.text || reply_message?.text || this.reply_message?.msg?.caption || reply_message?.conversation || "";
				this.reply_message.caption = this.reply_message.msg?.caption;
				this.reply_message.isAnimatedSticker = this.reply_message.msg?.isAnimated;
				this.reply_message.seconds = this.reply_message.msg?.seconds;
				this.reply_message.duration = this.reply_message.msg?.seconds;
				this.reply_message.width = this.reply_message.msg?.width;
				this.reply_message.height = this.reply_message.msg?.height;
				this.reply_message.isEval = this.reply_message.text ? ["require", "await", "return"].map(a => this.reply_message.text.includes(a)).includes(true) : false
				this.reply_message.mime = this.reply_message.msg?.mimetype;
				this.reply_message.number = this.reply_message.sender ? this.reply_message.sender.replace(/[^0-9]/g, '') : undefined;
				this.reply_message.data = M.fromObject({
					key: {
						remoteJid: this.reply_message?.from,
						fromMe: this.reply_message?.fromMe,
						id: this.reply_message.id,
						participant: jidNormalizedUser(this.msg?.contextInfo?.participant)
					},
					message: this.reply_message.message,
					...(this.reply_message?.isGroup ? {
						participant: this.reply_message?.sender
					} : {}),
				});
				this.reply_message.delete = () => conn.sendMessage(this.reply_message?.from, {
					delete: this.reply_message.data.key
				});
				this.reply_message.download = (pathFile) => conn.downloadMediaMessage(this.reply_message?.msg, pathFile);
			} else {
				this.reply_message = new Object();
				this.reply_message.i = false;
				this.reply_message.mention = new Object();
			}
		}
	}
	_client(conn, createrS) {
		this.number = this.sender.replace(/[^0-9]/g, '');
		this.botNumber = jidNormalizedUser(conn.user.id);
		this.displayId = this.body = this.displayText = this.message?.conversation || this.message?.[this.type]?.text || this.message?.[this.type]?.caption || this.message?.[this.type]?.contentText || this.message?.[this.type]?.selectedDisplayText || this.message?.[this.type]?.title || this.text || "";
		this.budy = typeof this.text == "string" ? this.text : "";
		this.pushName = this.pushName || "No Name";
		this.botNumber = jidNormalizedUser(conn.user.id);
		this.caption = this.message?.[this.type]?.caption;
		this.secounds = this.message?.secounds;
		this.mention = new Object();
		this.mention.jid = this.msg?.contextInfo?.mentionedJid || [];
		this.mention.isBotNumber = this.mention.jid.includes(this.botNumber);
		this.mention.isOwner = (this.admins.map((v) => this.mention.jid.includes(v))).includes(true)
		this.isCreator = this.admins.map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(this.sender);
		this.itsMe = this.sender == this.botNumber ? true : false;
		this.quoted = this.reply_message?.from ? this.reply_message : this;
		this.mime = (this.quoted.msg || this.quoted).mimetype || "text";
		this.isMedia = /image|video|sticker|audio/.test(this.mime);
		this.from = this.key.remoteJid;
		this.image = this.message?.imageMessage ? this.message.imageMessage : false;
		this.video = this.message?.videoMessage ? this.message.videoMessage : false;
		this.location = this.message?.locationMessage ? this.message.locationMessage : false;
		this.sticker = this.message?.stickerMessage ? this.message.stickerMessage : false;
		this.audio = this.message?.audioMessage ? this.message.audioMessage : false;
		this.contact = this.message?.contactMessage ? this.message.contactMessage : false;
		this.document = this.message?.documentMessage ? this.message.documentMessage : false;
		this.isEval = ["require", "await", "return"].map(a => this.body.includes(a)).includes(true);
		this.number = this.sender.replace(/[^0-9]/g, "");
		this.user = {};
		this.user.jid = jidNormalizedUser(conn.user.id);
		this.user.number = this.user.jid.replace(/[^0-9]/g, "");
	}
	async download() {
		await this.client.downloadMediaMessage(this.msg);
	}
	async updateProfilePicture(jid, content) {
		content: WAMediaUpload;
		const {
			img
		} = await changeprofile(content);
		await this.client.query({
			tag: 'iq',
			attrs: {
				to: jidNormalizedUser(jid),
				type: 'set',
				xmlns: 'w:profile:picture'
			},
			content: [{
				tag: 'picture',
				attrs: {
					type: 'image'
				},
				content: img
			}]
		})
	}
	getName(jid, withoutContact = false) {
		const id = this.client.decodeJid(jid)
		withoutContact = this.client.withoutContact || withoutContact
		let v
		if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
			v = this.store.contacts[id] || {}
			if (!(v.name || v.subject)) v = this.client.groupMetadata(id) || {}
			resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
		})
		else v = id === '0@s.whatsapp.net' ? {
			id,
			name: 'WhatsApp'
		} : id === this.client.decodeJid(this.client.user.id) ? this.client.user : (this.store.contacts[id] || {})
		return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
	}
	async sendSticker(jid, content, options = {}) {
		const isBuffer = Buffer.isBuffer(content);
		if (!isBuffer) content = await getBuffer(content);
		const {
			mime
		} = await fromBuffer(content);
		if (mime.includes('webp')) {
			return await this.client.sendMessage(jid, {
				sticker: {
					url: await writeExifWebp(content, {
						packname: options.packname,
						author: options.author ? options.author : options.packname ? undefined : ' '
					})
				},
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			})
		} else if (mime.includes('image')) {
			if (options.packname || options.author) {
				return await this.client.sendMessage(jid, {
					sticker: {
						url: await writeExifImg(content, {
							packname: options.packname,
							author: options.author
						})
					},
					...options,
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: options.quoted
				})
			} else {
				return await this.client.sendMessage(jid, {
					sticker: await imageToWebp(content),
					...options,
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: options.quoted
				})
			}
		} else if (mime.includes('video')) {
			if (options.packname || options.author) {
				return await this.client.sendMessage(jid, {
					sticker: {
						url: await writeExifVid(content, {
							packname: options.packname,
							author: options.author
						})
					},
					...options,
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: options.quoted
				})
			} else {
				return await this.client.sendMessage(jid, {
					sticker: await videoToWebp(content),
					...options,
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: options.quoted
				})
			}
		}
	}
	async sendFromUrl(path, filename = "", caption = "", quoted, ptt = false, options = {}) {
		let type = await this.client.getFile(path, true);
		let {
			res,
			data: file,
			filename: pathFile
		} = type;
		if ((res && res.status !== 200) || file.length <= 65536) {
			try {
				return {
					json: JSON.parse(file.toString())
				};
			} catch (e) {
				if (e.json) return e.json;
			}
		}
		let opt = {
			filename
		};
		if (quoted) opt.quoted = quoted;
		if (!type)
			if (options.asDocument) options.asDocument = true;
		let mtype = "",
			mimetype = type.mime;
		let naem = (a) => "../../media/" + Date.now() + "." + a;
		if (/webp/.test(type.mime)) mtype = "sticker";
		else if (/image/.test(type.mime)) mtype = "image";
		else if (/video/.test(type.mime)) mtype = "video";
		else if (/audio/.test(type.mime))
			(ss = await (ptt ? toPTT : toAudio)(file, type.ext)),
			(skk = await require("file-type").fromBuffer(ss.data)),
			(ty = naem(skk.ext)),
			require("fs").writeFileSync(ty, ss.data),
			(pathFile = ty),
			(mtype = "audio"),
			(mimetype = "audio/mpeg");
		else mtype = "document";
		this.client.sendMessage(this.from, {
			...options,
			caption,
			ptt,
			fileName: filename,
			[mtype]: {
				url: pathFile
			},
			mimetype,
		}, {
			...opt,
			...options,
		}).then(() => {
			fs.unlinkSync(pathFile);
		});
	};
	async reply(text, chatId = this.from, options = {}) {
		return await this.client.sendMessage(chatId, {
			text: util.format(text)
		}, {
			quoted: this
		});
	}
	async sendReply(data, options = {}, type) {
		let nonUrl = false;
		if (type == "text") nonUrl = true;
		if (nonUrl) return this.send(data);
		return await this.client.sendMessage(this.from, {
			[type]: {
				url: data
			},
			...options
		});
	}
	async sendGroupInviteMessage(NoNnumber) {
		const number = NoNnumber.replace(/[^0-9]/g,'');
		const groupMetadata = await this.client.groupMetadata(this.from).catch(e => {})
		const participants = await groupMetadata.participants
		let NumToArr = [number.toString()];
		let _participants = participants.map(user => user.id)
		let users = (await Promise.all(NumToArr.map(v => v.replace(/[^0-9]/g, '')).filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net')).map(async v => [
			v,
			await this.client.onWhatsApp(v + '@s.whatsapp.net')
		]))).filter(v => v[1][0]?.exists).map(v => v[0] + '@c.us')
		const response = await this.client.query({
			tag: 'iq',
			attrs: {
				type: 'set',
				xmlns: 'w:g2',
				to: this.from,
			},
			content: users.map(jid => ({
				tag: 'add',
				attrs: {},
				content: [{
					tag: 'participant',
					attrs: {
						jid
					}
				}]
			}))
		})
		const jpegThumbnail = null
		const add = getBinaryNodeChild(response, 'add')
		const participant = getBinaryNodeChildren(response, 'add')
		let anu = participant[0].content.filter(v => v)
		if (anu[0].attrs.error == 408) return await this.send(`Unable to add @${anu[0].attrs.jid.split('@')[0]}!\nThe news is that @${anu[0].attrs.jid.split('@')[0]} just left this group`)
		for (const user of participant[0].content.filter(item => item.attrs.error == 403)) {
			const jid = user.attrs.jid
			const content = getBinaryNodeChild(user, 'add_request')
			const invite_code = content.attrs.code
			const invite_code_exp = content.attrs.expiration
			const {
				subject,
				desc
			} = await this.client.groupMetadata(this.from);
			const caption = desc || 'Invitation to join my WhatsApp group';
			return await sendInvaite(this.from, this.client, jid, invite_code, invite_code_exp, subject, caption, jpegThumbnail)
		}
	};
	isMediaURL(url) {
		const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'webp'];
		if (!url.includes('.')) return false;
		const extension = url.split('.').pop().toLowerCase();
		return (mediaExtensions.includes(extension) && url.startsWith('http'))
	}
	async forwardMessage(jid, content, options = {}) {
		let externalAdReply, text = false;
		const isBuffer = Buffer.isBuffer(content);
		const IsMediaUrl = isBuffer ? false : (typeof content != "object") ? this.isMediaURL(content.trim()) : false;
		const messageObj = (!isBuffer && !IsMediaUrl) ? (content?.message || content?.viewOnceMessageV2 || content?.reply_message?.viewOnceMessageV2) ? false : ((!content?.mime && !content?.client?.mime && !content?.reply_message?.mime) || content?.client?.mime == 'text') ? true : false : false;
		content = content?.message?.conversation ?
			content.message.conversation :
			content?.message?.extendedTextMessage ?
			content.message.extendedTextMessage.text :
			content?.reply_message?.extendedTextMessage ?
			content.reply_message.extendedTextMessage.text :
			content?.extendedTextMessage ?
			content.extendedTextMessage.text :
			content?.reply_message?.conversation ?
			content.reply_message.conversation :
			content?.conversation ?
			content.conversation :
			content?.message ?
			await this.client.save(content) :
			(typeof content == 'string') ?
			content :
			isBuffer ?
			content :
		    getContentType(content) ?
			await this.client.save({message: content}) :
			messageObj ?
			content :
			content?.viewOnceMessageV2 ?
			await this.client.save(content.viewOnceMessageV2) :
			content?.reply_message?.viewOnceMessageV2 ?
			await this.client.save(content.reply_message.viewOnceMessageV2) :
			content?.reply_message?.msg ?
			await this.client.save({
				message: {
					[content.reply_message.type]: content.reply_message.msg
				}
			}) :
			(content?.msg && content?.type) ?
			await this.client.save({
				message: {
					[content.type]: content.msg
				}
			}) :
			await this.client.save({
				message: content
			})
		if (!IsMediaUrl && typeof content == 'string' && (!options.forwardType || options.forwardType == 'text')) text = content;
		//LinkPreview
		if (options.linkPreview) {
			externalAdReply = {
				title: options.linkPreview.title,
				body: options.linkPreview.body,
				renderLargerThumbnail: options.linkPreview.renderLargerThumbnail || false,
				showAdAttribution: options.linkPreview.showAdAttribution,
				mediaType: options.linkPreview.mediaType,
				thumbnailUrl: options.linkPreview.thumbnailUrl,
				previewType: options.linkPreview.previewType,
				containsAutoReply: options.linkPreview.containsAutoReply,
				thumbnail: options.linkPreview.thumbnail,
				mediaUrl: options.linkPreview.mediaUrl || options.linkPreview.mediaurl,
				sourceUrl: options.linkPreview.sourceUrl || options.linkPreview.sourceurl
			}
		}
		const opt = {
			mimetype: (options.mimetype || options.mime),
			jpegThumbnail: options.jpegThumbnail,
			mentions: options.mentions,
			fileName: (options.fileName || options.filename || options.name),
			fileLength: (options.fileLength || options.filesize || options.size),
			caption: options.caption,
			headerType: options.headerType,
			ptt: options.ptt,
			gifPlayback: (options.gifPlayback || options.gif),
			viewOnce: (options.viewOnce || options.vv),
			seconds: (options.seconds || options.duration),
			waveform: (options.waveform || options.wave),
			contextInfo: {}
		}
		if (!content?.buff && messageObj && (typeof content != 'string') && (!options.forwardType || options.forwardType != 'text')) {
			content = content?.reply_message?.i ? content.reply_message : content;
		 const msg = await generateWAMessageFromContent(jid, content, {
				quoted: (options.quoted && options.quoted?.message && options.quoted?.key)?options.quoted:null
			});
			const keys = Object.keys(msg.message)[0];
			msg.message[keys].contextInfo = msg.message[keys].contextInfo || {};
			if (options.contextInfo?.mentionedJid) msg.message[keys].contextInfomentionedJid = Array.isArray(options.contextInfo.mentionedJid) ? options.contextInfo.mentionedJid : [options.contextInfo.mentionedJid];
			if (options.contextInfo?.forwardingScore) msg.message[keys].contextInfo.forwardingScore = options.contextInfo.forwardingScore;
			if (options.contextInfo?.isForwarded) msg.message[keys].contextInfo.isForwarded = options.contextInfo.isForwarded;
			if (externalAdReply) msg.message[keys].contextInfo.externalAdReply = externalAdReply;
			return await this.client.relayMessage(jid, msg.message, {})
		} else if (!text && (!options.forwardType || options.forwardType != 'text')) {
			let buff = content,
				mimetype = false,
				model = false;
			if (!isBuffer && typeof content == 'object') {
				buff = content.buff;
				mimetype = content.mime;
				model = content.type;
			} else if (IsMediaUrl) {
				buff = await getBuffer(buff.trim())
			} else if (!isBuffer) {
				buff = {
					url: buff.trim()
				}
			}
			let mime = Buffer.isBuffer(buff) ? await (await require("file-type").fromBuffer(buff)).mime : opt.mimetype ? opt.mimetype : undefined;
			let type = (mime && mime.split('/')[1]) == 'webp' ? 'sticker' : (mime && mime.split('/')[0]) == 'video' ? 'video' : (mime && mime.split('/')[0]) == 'audio' ? 'audio' : 'image';
			type = (options.forwardType || model || type).toLowerCase().trim();
			if (type == "sticker") {
				opt.quoted = (options.quoted && options.quoted?.message && options.quoted?.key)?options.quoted:null;
				if (options.contextInfo?.mentionedJid) opt.contextInfo.mentionedJid = Array.isArray(options.contextInfo.mentionedJid) ? options.contextInfo.mentionedJid : [options.contextInfo.mentionedJid];
				if (options.contextInfo?.forwardingScore) opt.contextInfo.forwardingScore = options.contextInfo.forwardingScore;
				if (options.contextInfo?.isForwarded) opt.contextInfo.isForwarded = options.contextInfo.isForwarded;
				if (externalAdReply) opt.contextInfo.externalAdReply = externalAdReply;
				return await this.sendSticker(jid, buff, {
					packname: options.packname,
					author: options.author,
					...opt
				});
			} else {
				const option = {
					contextInfo: {}
				}
				for (let key in opt) {
					if (opt[key] != undefined) {
						if (!Array.isArray(opt[key]) || !opt[key].includes(undefined)) {
							option[key] = opt[key]
						}
					}
					if (opt.seconds) option.seconds = [opt.seconds];
					if (opt.waveform) option.waveform = opt.waveform;
				}
				if ((type == 'audio') && option.waveform) {
					option.mimetype = "audio/ogg; codecs=opus";
					option.ptt = false;
				}
				if (!option.mimetype) option.mimetype = mimetype || mime;
				if (options.contextInfo?.mentionedJid) option.contextInfo.mentionedJid = Array.isArray(options.contextInfo.mentionedJid) ? options.contextInfo.mentionedJid : [options.contextInfo.mentionedJid];
				if (options.contextInfo?.forwardingScore) option.contextInfo.forwardingScore = options.contextInfo.forwardingScore;
				if (options.contextInfo?.isForwarded) option.contextInfo.isForwarded = options.contextInfo.isForwarded;
				if (externalAdReply) option.contextInfo.externalAdReply = externalAdReply;
				return await this.client.sendMessage(jid, {
					[type]: buff,
					...option,
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: (options.quoted && options.quoted?.message && options.quoted?.key)?options.quoted:null
				})
			}
		} else {
			if (options.linkPreview) opt.contextInfo.externalAdReply = externalAdReply;
			if (opt.contextInfo.externalAdReply && Object.keys(opt.contextInfo.externalAdReply).length != 0) {
				opt.contextInfo.externalAdReply.previewType = "PHOTO"
				opt.contextInfo.externalAdReply.containsAutoReply = true
			}
			return await this.client.sendMessage(jid, {
				text: util.format(content),
				...opt,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: (options.quoted && options.quoted?.message && options.quoted?.key)?options.quoted:null
			})
		}
	}

	parsedJid(text = "") {
		return text.split(',').map(a => a.trim())
	}
	async fakeReply(jid, text = '', fakeJid = this.client.user.jid, fakeText = '', fakeGroupJid, options = {}) {
		return this.client.reply(jid, text, {
			key: {
				fromMe: areJidsSameUser(fakeJid, this.client.user.id),
				participant: fakeJid,
				...(fakeGroupJid ? {
					remoteJid: fakeGroupJid
				} : {})
			},
			message: {
				conversation: fakeText
			},
			...options
		})
	}
	async editMessage(jid, msg, key) {
		return await this.client.relayMessage(jid, {
			protocolMessage: {
				key: key,
				type: 14,
				editedMessage: {
					conversation: msg
				}
			}
		}, {})
	}
	async edit(msg, key) {
		return await this.client.relayMessage(this.jid, {
			protocolMessage: {
				key: key,
				type: 14,
				editedMessage: {
					conversation: msg
				}
			}
		}, {})
	}
	//func4
	async sendPayment(jid, text = '', from, amount, currency, options) {
		let a = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LVL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "USS", "UYI", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XFU", "XOF", "XPD", "XPF", "XPT", "XTS", "XXX", "YER", "ZAR", "ZMW"]
		let b = a[Math.floor(Math.random() * a.length)]
		const requestPaymentMessage = {
			amount: {
				currencyCode: currency || b,
				offset: 0,
				value: amount || 9.99
			},
			expiryTimestamp: 0,
			amount1000: (amount || 9.99) * 1000,
			currencyCodeIso4217: currency || b,
			requestFrom: from || '0@s.whatsapp.net',
			noteMessage: {
				extendedTextMessage: {
					text: text || 'Example Payment Message'
				}
			},
			background: undefined
		};
		return await this.client.relayMessage(jid, {
			requestPaymentMessage
		}, {
			...options
		});
	}
	// func 5
	async getQuotedObj() {
		return proto.WebMessageInfo.fromObject({
			key: {
				fromMe: this.fromMe,
				remoteJid: this.from,
				id: this.id
			},
			message: this.msg?.contextInfo?.quotedMessage,
			...(this.isGroup ? {
				participant: this.sender
			} : {})
		})
	}
	//func 6
	async vM() {
		return proto.WebMessageInfo.fromObject({
			key: {
				fromMe: this.fromMe,
				remoteJid: this.from,
				id: this.id
			},
			message: this.msg?.contextInfo?.quotedMessage,
			...(this.IsGroup ? {
				participant: this.sender
			} : {})
		})
	}
	//end
	async send(content, options = {}, type = 'text') {
		if (type != 'text' && !Buffer.isBuffer(content) && (typeof content != 'object')) content = await getBuffer(content);
		if (options.linkPreview) {
			options.contextInfo = {
				externalAdReply: options.linkPreview,
				mentionedJid: options?.contextInfo?.mentionedJid || options.mentionedJid
			};
			delete options.linkPreview;
		}
		if (type == 'text') {
			if (options?.contextInfo?.externalAdReply) {
				options.contextInfo.externalAdReply.previewType = "PHOTO"
				options.contextInfo.externalAdReply.containsAutoReply = true
			}
			let msgs = await this.client.sendMessage(this.jid, {
				text: util.format(content),
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
			msgs.edit = async (text) => {
				return await this.client.relayMessage(this.jid, {
					protocolMessage: {
						key: msgs.key,
						type: 14,
						editedMessage: {
							conversation: text
						}
					}
				}, {})
			}
			msgs.react = async (x) => {
				return await this.client.sendMessage(this.jid, {
					react: {
						text: x,
						key: msgs.key
					}
				});
			}
			msgs.delete = async () => {
				return await this.client.sendMessage(this.jid, {
					delete: msgs.key
				});
			}
			return msgs;
		} else if (type == 'image') {
			return await this.client.sendMessage(this.jid, {
				image: content,
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
		} else if (type == 'video') {
			return await this.client.sendMessage(this.jid, {
				video: content,
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
		} else if (type == 'sticker') {
			return await this.sendSticker(this.jid, content, {
				packname: options.packname,
				author: options.author,
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			});
		} else if (type == 'audio') {
			return await this.client.sendMessage(this.jid, {
				audio: content,
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
		} else if (type == 'edit') {
			return await this.client.sendMessage(this.jid, {
				text: content.text,
				edit: content.key
			}, {
				quoted: options.quoted
			});
		} else if (type == 'react') {
			return await this.client.sendMessage(this.jid, {
				react: {
					text: content.text,
					key: content.key
				}
			});
		} else if (type == 'delete') {
			return await this.client.sendMessage(this.jid, {
				delete: content.key
			});
		} else if (type == 'contact') {
			const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
				+
				'VERSION:3.0\n' +
				`FN:${content.name}\n` // full name
				+
				`ORG:${content.org};\n` // the organization of the contact
				+
				`TEL;type=CELL;type=VOICE;waid=${content.whatsapp}:${content.phone}\n` // WhatsApp ID + phone number
				+
				'END:VCARD'
			return await this.client.sendMessage(
				this.jid, {
					contacts: {
						displayName: content.name,
						contacts: [{
							vcard,
							...options
						}]
					},
					ephemeralExpiration: WA_DEFAULT_EPHEMERAL
				}, {
					quoted: options.quoted
				});
		} else if (type == 'document') {
			return await this.client.sendMessage(this.jid, {
				document: content,
				...options,
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
		} else if (type == 'location') {
				return await this.client.sendMessage(this.jid,{ location: { degreesLatitude: content.degreesLatitude, degreesLongitude: content.degreesLongitude } })
		} else if (type == 'poll') {
			const poll = await this.client.sendMessage(this.jid, {
				poll: {
					name: content.name,
					values: content.values.map(v=>v.name),
					selectableCount: content.selectableCount
				},
				ephemeralExpiration: WA_DEFAULT_EPHEMERAL
			}, {
				quoted: options.quoted
			});
			this.store.poll_message.message.push({
				[poll.key.id]: {
					withPrefix: content.withPrefix || false,
					values: content.values,
					onlyOnce: content.onlyOnce || false,
					participates: content.participates || [],
					votes: []
				}
			});
			return poll;
		}
	}
}
module.exports = {
	serialize,
	WAConnection
};
