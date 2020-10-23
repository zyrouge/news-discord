// Source: https://github.com/riyacchi/eris-reactions

import { EventEmitter } from "events";
import Eris from "eris";

export interface ReactionHandlerOpts {
    maxMatches: number;
    time: number;
}

export interface ReactionCollect {
    msg: Eris.PossiblyUncachedMessage;
    emoji: Eris.PartialEmoji;
    userID: string;
}

export interface ReactionHandler {
    on(name: "reacted", handler: (reaction: ReactionCollect) => void): this;

    on(
        name: "end",
        handler: (
            reactions: ReactionCollect[],
            reason: "time" | "maxMatches"
        ) => void
    ): this;
}

export class ReactionHandler extends EventEmitter implements ReactionHandler {
    client: Eris.Client;
    filter: (userID: string) => boolean;
    message: Eris.Message;
    options: ReactionHandlerOpts;
    permanent: boolean;
    ended: boolean;
    collected: ReactionCollect[];
    listener: (
        msg: Eris.Message | Eris.PossiblyUncachedMessage,
        emoji: Eris.PartialEmoji,
        reactor: string
    ) => boolean;

    constructor(
        client: Eris.Client,
        message: Eris.Message,
        filter: (userID: string) => boolean,
        permanent: boolean = false,
        options: ReactionHandlerOpts
    ) {
        super();

        this.client = client;
        this.filter = filter;
        this.message = message;
        this.options = options;
        this.permanent = permanent;
        this.ended = false;
        this.collected = [];

        this.listener = (
            msg: Eris.PossiblyUncachedMessage,
            emoji: Eris.PartialEmoji,
            reactor: string
        ) => this.checkPreConditions(msg, emoji, reactor);

        this.client.on("messageReactionAdd", this.listener);

        if (options.time) {
            setTimeout(() => this.stopListening("time"), options.time);
        }
    }

    checkPreConditions(
        msg: Eris.Message | Eris.PossiblyUncachedMessage,
        emoji: Eris.PartialEmoji,
        reactor: string
    ) {
        if (this.message.id !== msg.id) {
            return false;
        }

        if (this.filter(reactor)) {
            const coll: ReactionCollect = { msg, emoji, userID: reactor };
            this.collected.push(coll);
            this.emit("reacted", coll);

            if (this.collected.length >= this.options.maxMatches) {
                this.stopListening("maxMatches");
                return true;
            }
        }

        return false;
    }

    stopListening(reason: string) {
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

export function collectReactions(
    client: Eris.Client,
    message: Eris.Message,
    filter: (userID: string) => boolean,
    options: ReactionHandlerOpts
): Promise<ReactionCollect[]> {
    const bulkCollector = new ReactionHandler(
        client,
        message,
        filter,
        false,
        options
    );

    return new Promise((resolve) => {
        bulkCollector.on("end", resolve);
    });
}
