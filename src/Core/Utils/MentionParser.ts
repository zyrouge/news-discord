export const Mentions = {
    User: /<@!?(\d{17,19})>/,
    Role: /<@&(\d{17,19})>/,
    Channel: /<#(\d{17,19})>/
};

export class MentionsManager {
    static UserMention(content: string) {
        const matches = content.match(Mentions.User);
        return matches ? matches[1] : undefined;
    }

    static RoleMention(content: string) {
        const matches = content.match(Mentions.Role);
        return matches ? matches[1] : undefined;
    }

    static ChannelMention(content: string) {
        const matches = content.match(Mentions.Channel);
        return matches ? matches[1] : undefined;
    }
}
