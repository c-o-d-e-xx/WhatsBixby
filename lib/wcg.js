/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

const {check, sleep} = require("i-nrl");

class WCG {
	constructor(message) {
		this.jid = message.jid;
		this.sender = message.sender;
		this.word = (message.body || "").toLowerCase().replace('wcg', '').replace(/[^a-z]/g, '');
		this.group = message.isGroup;
		this.m = message;
		this.possible = message.isCreator;
		this.bot = message.isBot;
	}
	async start() {
		if (this.bot || !this.group) return;
		if (this.word == "start" && !this.possible) return;
		if (this.word == "start" && this.possible && this.anyGame()) return await this.m.send("_⚠️Another game cannot continue because one game is currently in progress⚠️_\n_*wcg stop* to stop current game_");
		if (!this.anyGame() && this.word == "start" && this.possible) {
			await this.m.send(`_@${this.m.number} joined to this game_`, {
				mentions: [this.m.sender]
			});
			const start = this.m.client.wcg[this.jid] = {
				[this.sender]: {
					round: 1,
					out: false,
					success: false,
					Length: 3,
					time: 40000,
					letter: this.letter(),
					words: []
				}
			};
			let msg = await this.m.send("*🎮 game starts in 1minute*\n```type``` *join* ```to join the game```");
			await sleep(15000);
			await msg.edit("*🎮 game starts in 45s*\n```type``` *join* ```to join the game```");
			await sleep(15000);
			msg = await this.m.send("*🎮 game starts in 30s*\n```type``` *join* ```to join the game```");
			await sleep(15000);
			await msg.edit("*🎮 game starts in 15s*\n```type``` *join* ```to join the game```");
			await sleep(7000);
			msg = await this.m.send("*🎮 game starts in 07s*\n```type``` *join* ```to join the game```");
			await sleep(7000);
			msg = await this.m.send("*🎮 generating game!*");
			const keys = Object.keys(this.m.client.wcg[this.jid]);
			if (keys.length < 2) {
				delete this.m.client.wcg[this.jid];
				return await msg.edit(`not enough payer's, game terminated!`);
			}
			const players = keys.filter(a => a.includes('@s.whatsapp.net'));
			this.m.client.wcg[this.jid].now = players[0];
			const player = this.m.client.wcg[this.jid][players[0]];
			await this.m.send(`_*player :* @${players[0].replace(/[^0-9]/g,'')}_
_*next player :* @${players[1].replace(/[^0-9]/g,'')}_
_*current round:* 1_

 *_rules ⚖️_*

*_• word must start with ${player.letter}_*
*_• word must been includes 3 letters_*

*_game info 🛠️_*

_time remaining 40 seconds_
_total players ${players.length}_`, {
				mentions: [players[0], players[1]]
			});
			return await this.checkTimout(40000, player, players[0]);
		} else if (this.isJoinTime() && this.word == 'join') {
			if (!this.isNewPlayer()) return await this.m.send(`_@${this.m.number}  already joined to this game_`, {
				mentions: [this.m.sender]
			});
			this.m.client.wcg[this.jid][this.sender] = {
				round: 1,
				out: false,
				success: false,
				Length: 3,
				time: 40000,
				letter: this.letter(),
				words: []
			};
			await this.m.send(`_@${this.m.number} joined to this game_`, {
				mentions: [this.m.sender]
			});
		}
		if (!this.anyGame()) return;
		if (!this.m.client.wcg[this.jid].now) return;
		if (this.sender != this.m.client.wcg[this.jid].now) return;
		await this.run_game();
	}
	async run_game() {
		if (!this.m.client.wcg[this.jid].started) this.m.client.wcg[this.jid].started = true;
		if (!this.m.client.wcg[this.jid].words) this.m.client.wcg[this.jid].words = [];
		await this.validateData();
	}
	async validateData() {
			if (this.m.client.wcg[this.jid].now != this.sender) return;
			const keys = Object.keys(this.m.client.wcg[this.jid]);
			const players = keys.filter(a => a.includes('@s.whatsapp.net'));
			const active_p = players.filter(a => this.m.client.wcg[this.jid][a].out == false);
			const player = this.m.client.wcg[this.jid][this.m.client.wcg[this.jid].now]
			const player_id = active_p.indexOf(this.m.client.wcg[this.jid].now);
			const new_player_id = active_p[player_id + 1] ? player_id + 1 : 0;
			if (!this.word.startsWith(player.letter)) {
				await this.m.send({key: this.m.key, text:'❌'}, {},'react');
				return await this.m.send(`_The Word Must be Starts with Letter *${player.letter}*_`);
			}
			if (this.m.client.wcg[this.jid].words.includes(this.word)) {
				await this.m.send({key: this.m.key, text:'❌'}, {},'react');
				return await this.m.send(`_The Word *${this.word}* is Aldready Used. Use Another Word_`);
			}
			if (this.word.length < player.Length) {
				await this.m.send({key: this.m.key, text:'❌'}, {},'react');
				return await this.m.send(`_The Word Must Contain *${player.Length}* Or More Letters_`);
			}
			if (!await this.checkWord(this.word)) {
				await this.m.send({key: this.m.key, text:'❌'}, {},'react');
				return await this.m.send(`_The Enterd Word *${this.word}* Is Not A Valid Word_`);
			}
			await this.m.send({key: this.m.key, text:'✅'}, {},'react');
			player.success = true;
			player.round = player.round + 1;
			player.time = player.round < 3 ? 40000 : player.round < 5 ? 35000 : player.round == 5 ? 30000 : player.round == 6 ? 25000 : player.round == 7 ? 20000 : 15000;
			player.Length = player.round == 2 ? 4 : player.round <= 4 ? 5 : player.round <= 6 ? 6 : player.round == 7 ? 7 : 8;
			this.m.client.wcg[this.jid].words.push(this.word);
			player.words.push(this.word);
			this.m.client.wcg[this.jid].now = active_p[new_player_id];
			const next_player_id = active_p[new_player_id + 1] ? new_player_id + 1 : 0;
			const new_player = this.m.client.wcg[this.jid][active_p[new_player_id]];
			const next_player = this.m.client.wcg[this.jid][active_p[next_player_id]];
			new_player.letter = this.word.split("").pop();
			if (new_player.success) new_player.success = false;
			await this.m.send(`_*player :* @${active_p[new_player_id].replace(/[^0-9]/g,'')}_
_*next player :* @${active_p[next_player_id].replace(/[^0-9]/g,'')}_
_*current round:* ${new_player.round}_

 *_rules ⚖️_*

*_• word must start with ${new_player.letter}_*
*_• word must been includes ${new_player.Length} letters_*

*_game info 🛠️_*

_time remaining ${new_player.time.toString().replace('000','')} seconds_
_total players ${active_p.length}/${players.length}_`, {
				mentions: [active_p[new_player_id], active_p[next_player_id]]
			});
			return await this.checkTimout(new_player.time, new_player, this.m.client.wcg[this.jid].now);
	}
	getLargestWord(array) {
		return array.sort((a, b) => b.length - a.length);
		}
	anyGame() {
		return this.m.client.wcg[this.jid] ? true : false;
	}
	isNewPlayer() {
		return this.m.client.wcg[this.jid] && !this.m.client.wcg[this.jid][this.sender] ? true : false;
	}
	isJoinTime() {
		return this.m.client.wcg[this.jid] && !this.m.client.wcg[this.jid].started ? true : false;
	}
	async checkTimout(ms, p, id) {
		const round = p.round
		await sleep(ms);
		const current = this.m.client.wcg[this.jid][id];
		const keys = Object.keys(this.m.client.wcg[this.jid]);
		const players = keys.filter(a => a.includes('@s.whatsapp.net'));
		if (round == current.round && !current.success) {
			this.m.client.wcg[this.jid][id].out = true;
			await this.m.send(`_@${id.replace(/[^0-9]/g,'')} Terminated From This Game_`, {
				mentions: [id]
			});
			const remains = players.filter(a => this.m.client.wcg[this.jid][a].out == false);
			if (remains.length < 2) {
				if(!this.m.client.wcg[this.jid][remains[0]].words[0]) {
					delete this.m.client.wcg[this.jid];
					return await this.m.send(`_not enough players to continue this game_`);
				}
				const large = this.getLargestWord(this.m.client.wcg[this.jid][remains[0]].words);
				await this.m.send(`_*@${remains[0].replace(/[^0-9]/g,'')}* Won The Game With Largest Word *${large[0]}* (${large[0].length})_`, {
					mentions: [remains[0]]
				});
				delete this.m.client.wcg[this.jid];
			} else {
				const active_p = players.filter(a => this.m.client.wcg[this.jid][a].out == false);
				const now = players.indexOf(id);
				const next = active_p[now] ? now : active_p[now+1] ?  now + 1 : 0;
				const new_player = this.m.client.wcg[this.jid][active_p[next]];
				const next_id = active_p[next + 1] ? next + 1 : 0;
				new_player.letter = this.letter();
				if (new_player.success) new_player.success = false;
				this.m.client.wcg[this.jid].now = active_p[next];
				await this.m.send(`_*player :* @${active_p[next].replace(/[^0-9]/g,'')}_
_*next player :* @${active_p[next_id].replace(/[^0-9]/g,'')}_
_*current round:* ${new_player.round}_

 *_rules ⚖️_*

*_• word must start with ${new_player.letter}_*
*_• word must been includes ${new_player.Length} letters_*

*_game info 🛠️_*

_time remaining ${new_player.time.toString().replace('000','')} seconds_
_total players ${active_p.length}/${players.length}_`, {
					mentions: [active_p[next], active_p[next_id]]
				});
				await this.checkTimout(new_player.time, new_player, active_p[next]);
			}
		}
	}
	letter() {
		const ar = "abcdefghijklmnopqrstuvwxyz";
		return ar[Math.floor(Math.random() * ar.length)]
	}
	async checkWord() {
		return check(this.word);
	}
}
module.exports = {
	WCG
}
