"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionsManager = exports.Mentions = void 0;
exports.Mentions = {
    User: /<@!?(\d{17,19})>/,
    Role: /<@&(\d{17,19})>/,
    Channel: /<#(\d{17,19})>/
};
class MentionsManager {
    static UserMention(content) {
        const matches = content.match(exports.Mentions.User);
        return matches ? matches[1] : undefined;
    }
    static RoleMention(content) {
        const matches = content.match(exports.Mentions.Role);
        return matches ? matches[1] : undefined;
    }
    static ChannelMention(content) {
        const matches = content.match(exports.Mentions.Channel);
        return matches ? matches[1] : undefined;
    }
}
exports.MentionsManager = MentionsManager;
