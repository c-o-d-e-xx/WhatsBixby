const fs = require("fs")
const chalk = require("chalk")
const events = require('events');
const pino = require('pino');

/**
 * InMemoryStore - Similar to makeInMemoryStore Baileys
 * Storing WA state in-memory, with event binding and error handling.
 */
class InMemoryStore extends events.EventEmitter {
    constructor(options = {}) {
        super();
        /**
         * Stores all contacts indexed by their ID.
         * @type {Object}
         */
        this.contacts = {};
        /**
         * Stores all chats indexed by their ID.
         * @type {Object}
         */
        this.chats = {};
        /**
         * Stores all messages, grouped by chat ID, then message ID.
         * @type {Object}
         */
        this.messages = {};
        /**
         * Stores presence information for each chat and participant.
         * @type {Object}
         */
        this.presences = {};
        /**
         * Stores metadata for each group.
         * @type {Object}
         */
        this.groupMetadata = {};
        /**
         * Stores call offer information by peer JID.
         * @type {Object}
         */
        this.callOffer = {};
        /**
         * Stores sticker packs by pack ID.
         * @type {Object}
         */
        this.stickerPacks = {};
        /**
         * Stores authentication state.
         * @type {Object}
         */
        this.authState = {};
        /**
         * Tracks which chats have completed history sync.
         * @type {Object}
         */
        this.syncedHistory = {};
        /**
         * Logger instance for debugging and info.
         */
        this.logger = options.logger || pino({ level: 'silent' });
    }

    /**
     * Loads the entire store state from a plain object.
     * Useful for restoring state from disk or external sources.
     * @param {Object} state - The state object to load into memory.
     */
    load(state = {}) {
        try {
            Object.assign(this, state);
            this.logger.info('Store loaded');
        } catch (e) {
            this.logger.error('Failed to load store: ' + e.message);
        }
    }

    /**
     * Saves the current store state to a plain object.
     * Can be used for persisting state to disk or external storage.
     * @returns {Object} The current state of the store.
     */
    save() {
        try {
            const state = {
                contacts: this.contacts,
                chats: this.chats,
                messages: this.messages,
                presences: this.presences,
                groupMetadata: this.groupMetadata,
                callOffer: this.callOffer,
                stickerPacks: this.stickerPacks,
                authState: this.authState,
                syncedHistory: this.syncedHistory,
            };
            this.logger.debug('Store saved');
            return state;
        } catch (e) {
            this.logger.error('Failed to save store: ' + e.message);
            return {};
        }
    }

    /**
     * Clears all state in the store, resetting all collections.
     */
    clear() {
        this.contacts = {};
        this.chats = {};
        this.messages = {};
        this.presences = {};
        this.groupMetadata = {};
        this.callOffer = {};
        this.stickerPacks = {};
        this.authState = {};
        this.syncedHistory = {};
        this.logger.info('Store cleared');
    }

    // --- Contacts ---

    /**
     * Sets multiple contacts at once.
     * @param {Object} contacts - Object of contacts to set.
     */
    setContacts(contacts = {}) {
        if (typeof contacts !== 'object') return;
        this.contacts = { ...this.contacts, ...contacts };
        this.emit('contacts.set', contacts);
    }

    /**
     * Inserts or updates a single contact.
     * @param {Object} contact - The contact object to upsert.
     */
    upsertContact(contact = {}) {
        if (!contact.id) return;
        this.contacts[contact.id] = { ...this.contacts[contact.id], ...contact };
        this.emit('contacts.upsert', [contact]);
    }

    /**
     * Updates existing contacts with new data.
     * @param {Array} update - Array of contact updates.
     */
    updateContact(update = []) {
        if (!Array.isArray(update)) return;
        for (const contact of update) {
            if (contact.id && this.contacts[contact.id]) {
                this.contacts[contact.id] = { ...this.contacts[contact.id], ...contact };
                this.emit('contacts.update', [contact]);
            }
        }
    }

    /**
     * Deletes contacts by their IDs.
     * @param {Array} ids - Array of contact IDs to delete.
     */
    deleteContact(ids = []) {
        if (!Array.isArray(ids)) return;
        for (const id of ids) {
            delete this.contacts[id];
        }
        this.emit('contacts.delete', ids);
    }

    // --- Chats ---

    /**
     * Sets multiple chats at once.
     * @param {Object} chats - Object of chats to set.
     */
    setChats(chats = {}) {
        if (typeof chats !== 'object') return;
        this.chats = { ...this.chats, ...chats };
        this.emit('chats.set', chats);
    }

    /**
     * Inserts or updates a single chat.
     * @param {Object} chat - The chat object to upsert.
     */
    upsertChat(chat = {}) {
        if (!chat.id) return;
        this.chats[chat.id] = { ...this.chats[chat.id], ...chat };
        this.emit('chats.upsert', [chat]);
    }

    /**
     * Updates existing chats with new data.
     * @param {Array} update - Array of chat updates.
     */
    updateChat(update = []) {
        if (!Array.isArray(update)) return;
        for (const chat of update) {
            if (chat.id && this.chats[chat.id]) {
                this.chats[chat.id] = { ...this.chats[chat.id], ...chat };
                this.emit('chats.update', [chat]);
            }
        }
    }

    /**
     * Deletes chats by their IDs.
     * @param {Array} ids - Array of chat IDs to delete.
     */
    deleteChat(ids = []) {
        if (!Array.isArray(ids)) return;
        for (const id of ids) {
            delete this.chats[id];
        }
        this.emit('chats.delete', ids);
    }

    // --- Messages ---

    /**
     * Sets all messages for a specific chat.
     * @param {string} chatId - The chat ID.
     * @param {Array} messages - Array of message objects.
     */
    setMessages(chatId, messages = []) {
        if (!chatId || !Array.isArray(messages)) return;
        this.messages[chatId] = messages.reduce((acc, msg) => {
            if (msg?.key?.id) acc[msg.key.id] = msg;
            return acc;
        }, {});
        this.emit('messages.set', { chatId, messages });
    }

    /**
     * Inserts or updates a single message in a chat.
     * @param {Object} message - The message object to upsert.
     * @param {string} type - The type of upsert (default: 'append').
     */
    upsertMessage(message = {}, type = 'append') {
        const chatId = message?.key?.remoteJid;
        if (!chatId || !message?.key?.id) return;
        if (!this.messages[chatId]) this.messages[chatId] = {};
        this.messages[chatId][message.key.id] = message;
        this.emit('messages.upsert', { messages: [message], type });
    }

    /**
     * Updates existing messages with new data.
     * @param {Array} updates - Array of message updates.
     */
    updateMessage(updates = []) {
        if (!Array.isArray(updates)) return;
        for (const update of updates) {
            const chatId = update?.key?.remoteJid;
            const msgId = update?.key?.id;
            if (chatId && msgId && this.messages[chatId]?.[msgId]) {
                this.messages[chatId][msgId] = { ...this.messages[chatId][msgId], ...update };
                this.emit('messages.update', [update]);
            }
        }
    }

    /**
     * Deletes messages by their keys.
     * @param {Array} keys - Array of message keys to delete.
     */
    deleteMessage(keys = []) {
        if (!Array.isArray(keys)) return;
        for (const key of keys) {
            const chatId = key?.remoteJid;
            const msgId = key?.id;
            if (chatId && msgId && this.messages[chatId]?.[msgId]) {
                delete this.messages[chatId][msgId];
                this.emit('messages.delete', [key]);
            }
        }
    }

    /**
     * Loads a specific message by chat ID and message ID.
     * @param {string} jid - The chat ID.
     * @param {string} id - The message ID.
     * @returns {Object|undefined} The message object or undefined if not found.
     */
    loadMessage(jid, id) {
        if (!jid || !id) return undefined;
        return this.messages[jid]?.[id];
    }

    // --- Presences ---

    /**
     * Sets presence information for a participant in a chat.
     * @param {string} chatId - The chat ID.
     * @param {Object} presence - The presence object.
     */
    setPresence(chatId, presence = {}) {
        if (!chatId || !presence?.participant) {
            this.logger.warn(`Presence set: invalid chatId or participant`);
            return;
        }
        if (!this.presences[chatId]) this.presences[chatId] = {};
        this.presences[chatId][presence.participant] = presence;
        this.emit('presence.set', { chatId, presence });
    }

    /**
     * Updates presence information for a participant in a chat.
     * @param {string} chatId - The chat ID.
     * @param {Object} presence - The presence object.
     */
    updatePresence(chatId, presence = {}) {
        if (!chatId || !presence?.participant) {
            this.logger.warn(`Presence update: invalid chatId or participant`);
            return;
        }
        if (!this.presences[chatId]) this.presences[chatId] = {};
        this.presences[chatId][presence.participant] = { ...this.presences[chatId][presence.participant], ...presence };
        this.emit('presence.update', { chatId, presence });
    }

    // --- Group Metadata ---

    /**
     * Sets metadata for a group.
     * @param {string} groupId - The group ID.
     * @param {Object} metadata - The group metadata object.
     */
    setGroupMetadata(groupId, metadata = {}) {
        if (!groupId) return;
        this.groupMetadata[groupId] = metadata;
        this.emit('groups.update', [{ id: groupId, ...metadata }]);
    }

    /**
     * Updates metadata for existing groups.
     * @param {Array} update - Array of group metadata updates.
     */
    updateGroupMetadata(update = []) {
        if (!Array.isArray(update)) return;
        for (const data of update) {
            if (data.id && this.groupMetadata[data.id]) {
                this.groupMetadata[data.id] = { ...this.groupMetadata[data.id], ...data };
                this.emit('groups.update', [data]);
            }
        }
    }

    // --- Call Offer ---

    /**
     * Sets a call offer for a peer JID.
     * @param {string} peerJid - The peer JID.
     * @param {Object} offer - The call offer object.
     */
    setCallOffer(peerJid, offer = {}) {
        if (!peerJid) return;
        this.callOffer[peerJid] = offer;
        this.emit('call', [{ peerJid, ...offer }]);
    }

    /**
     * Clears a call offer for a peer JID.
     * @param {string} peerJid - The peer JID.
     */
    clearCallOffer(peerJid) {
        if (!peerJid) return;
        delete this.callOffer[peerJid];
        this.emit('call.update', [{ peerJid, state: 'ENDED' }]);
    }

    // --- Sticker Packs ---

    /**
     * Sets all sticker packs.
     * @param {Array} packs - Array of sticker pack objects.
     */
    setStickerPacks(packs = []) {
        if (!Array.isArray(packs)) return;
        this.stickerPacks = packs.reduce((acc, pack) => {
            if (pack?.id) acc[pack.id] = pack;
            return acc;
        }, {});
        this.emit('sticker-packs.set', packs);
    }

    /**
     * Inserts or updates a single sticker pack.
     * @param {Object} pack - The sticker pack object.
     */
    upsertStickerPack(pack = {}) {
        if (!pack?.id) return;
        this.stickerPacks[pack.id] = { ...this.stickerPacks[pack.id], ...pack };
        this.emit('sticker-packs.upsert', [pack]);
    }

    // --- Auth State ---

    /**
     * Sets the authentication state.
     * @param {Object} state - The authentication state object.
     */
    setAuthState(state = {}) {
        this.authState = state;
    }

    /**
     * Gets the current authentication state.
     * @returns {Object} The authentication state.
     */
    getAuthState() {
        return this.authState;
    }

    // --- Synced History ---

    /**
     * Marks a chat as having completed history sync.
     * @param {string} jid - The chat ID.
     */
    markHistorySynced(jid) {
        if (!jid) return;
        this.syncedHistory[jid] = true;
    }

    /**
     * Checks if a chat has completed history sync.
     * @param {string} jid - The chat ID.
     * @returns {boolean} True if synced, false otherwise.
     */
    isHistorySynced(jid) {
        if (!jid) return false;
        return !!this.syncedHistory[jid];
    }

    /**
     * Binds all relevant events from an external event emitter to the store.
     * @param {EventEmitter} ev - The event emitter to bind.
     */
    bind(ev) {
        if (!ev?.on) throw new Error('Event emitter is required for binding');
        ev.on('contacts.set', (contacts) => this.setContacts(contacts));
        ev.on('contacts.upsert', (contacts) => Array.isArray(contacts) && contacts.forEach(this.upsertContact.bind(this)));
        ev.on('contacts.update', this.updateContact.bind(this));
        ev.on('contacts.delete', this.deleteContact.bind(this));

        ev.on('chats.set', (chats) => this.setChats(chats));
        ev.on('chats.upsert', (chats) => Array.isArray(chats) && chats.forEach(this.upsertChat.bind(this)));
        ev.on('chats.update', this.updateChat.bind(this));
        ev.on('chats.delete', this.deleteChat.bind(this));

        ev.on('messages.set', ({ messages, jid }) => this.setMessages(jid, messages));
        ev.on('messages.upsert', ({ messages, type }) => Array.isArray(messages) && messages.forEach(msg => this.upsertMessage(msg, type)));
        ev.on('messages.update', this.updateMessage.bind(this));
        ev.on('messages.delete', this.deleteMessage.bind(this));

        ev.on('presence.set', ({ id, presence }) => this.setPresence(id, presence));
        ev.on('presence.update', ({ id, presence }) => this.updatePresence(id, presence));

        ev.on('groups.update', this.updateGroupMetadata.bind(this));
        ev.on('groups.upsert', (groups) => Array.isArray(groups) && groups.forEach(group => this.setGroupMetadata(group.id, group)));

        ev.on('call', (calls) => Array.isArray(calls) && calls.forEach(call => {
            if (call.offer) {
                this.setCallOffer(call.peerJid, call);
            } else if (call.state === 'ENDED') {
                this.clearCallOffer(call.peerJid);
            }
        }));

        ev.on('sticker-packs.set', (packs) => this.setStickerPacks(packs));
        ev.on('sticker-packs.upsert', (packs) => Array.isArray(packs) && packs.forEach(this.upsertStickerPack.bind(this)));

        ev.on('auth-state.update', (state) => this.setAuthState(state));
        ev.on('history-sync.completed', (jid) => this.markHistorySynced(jid));
    }
}

/**
 * Factory function is similar to Baileys makeInMemoryStore.
 */
function makeInMemoryStore(options) {
    return new InMemoryStore(options);
}

module.exports = makeInMemoryStore;


// Refreshing File After Recode/Editing
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`\n› [ ${chalk.black(chalk.bgBlue(" Update Files "))} ] ▸ ${__filename}`)
    delete require.cache[file]
    require(file)
})
