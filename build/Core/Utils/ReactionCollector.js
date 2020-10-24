"use strict";
// Source: https://github.com/riyacchi/eris-reactions
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectReactions = exports.ReactionHandler = void 0;
const events_1 = require("events");
class ReactionHandler extends events_1.EventEmitter {
    constructor(client, message, filter, permanent = false, options) {
        super();
        this.client = client;
        this.filter = filter;
        this.message = message;
        this.options = options;
        this.permanent = permanent;
        this.ended = false;
        this.collected = [];
        this.listener = (msg, emoji, reactor) => this.checkPreConditions(msg, emoji, reactor);
        this.client.on("messageReactionAdd", this.listener);
        if (options.time) {
            setTimeout(() => this.stopListening("time"), options.time);
        }
    }
    checkPreConditions(msg, emoji, reactor) {
        if (this.message.id !== msg.id) {
            return false;
        }
        if (this.filter(reactor)) {
            const coll = { msg, emoji, userID: reactor };
            this.collected.push(coll);
            this.emit("reacted", coll);
            if (this.collected.length >= this.options.maxMatches) {
                this.stopListening("maxMatches");
                return true;
            }
        }
        return false;
    }
    stopListening(reason) {
        if (this.ended) {
            return;
        }
        this.ended = true;
        if (!this.permanent) {
            this.client.removeListener("messageReactionAdd", this.listener);
        }
        this.emit("end", this.collected, reason);
    }
}
exports.ReactionHandler = ReactionHandler;
function collectReactions(client, message, filter, options) {
    const bulkCollector = new ReactionHandler(client, message, filter, false, options);
    return new Promise((resolve) => {
        bulkCollector.on("end", resolve);
    });
}
exports.collectReactions = collectReactions;
