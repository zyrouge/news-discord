"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.config = void 0;
const NewsCore = __importStar(require("../Core"));
const axios_1 = __importDefault(require("axios"));
const lodash_1 = __importDefault(require("lodash"));
const html_entities_1 = require("html-entities");
exports.config = {
    name: "trivia",
    aliases: ["tri", "quiz"],
    description: "Create an interesting Quiz that you can answer",
    usage: "[1-10]",
    example: ["", "5"],
    category: "Utils",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = yield message.channel.createMessage("Fetching Trivias...");
    const amount = args[0] && !Number.isNaN(args[0]) ? parseInt(args[0]) : 5;
    const response = yield axios_1.default.get(NewsCore.Constants.trivia.api + amount.toString());
    const data = response.data;
    if (!data || !data.results || !data.results.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No Trivia was found",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    data.results = data.results.map((q) => (Object.assign(Object.assign({}, q), { answers: lodash_1.default.shuffle([q.correct_answer, ...q.incorrect_answers]) })));
    let current = 0;
    const numbers = { one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣" };
    const numAr = Object.values(numbers);
    const performance = [];
    msg.edit({
        content: "",
        embed: getEmbed(data.results[current])
    });
    numAr.forEach((e) => msg.addReaction(e).catch(() => { }));
    const reactor = new NewsCore.Utils.ReactionHandler(News.bot, msg, (userID) => userID === message.author.id, false, { maxMatches: 10, time: 1 * 60 * 1000 });
    reactor.on("reacted", (reaction) => {
        if (numAr.includes(reaction.emoji.name)) {
            let currentQuestion = data.results[current];
            let emojiIndex = numAr.findIndex((e) => e === reaction.emoji.name);
            let choosenAnswer = currentQuestion.answers[emojiIndex];
            performance.push(choosenAnswer === currentQuestion.correct_answer);
            current += 1;
            if (data.results[current]) {
                msg.edit({ embed: getEmbed(data.results[current]) });
                msg.removeReaction(reaction.emoji.name, message.author.id).catch(() => { });
            }
            else {
                msg.edit({ embed: getPerformance() });
                msg.removeReactions().catch(() => { });
                reactor.stopListening("done");
            }
        }
    });
    reactor.on("end", () => {
        if (current + 1 !== data.results.length)
            msg.edit({
                content: `${NewsCore.Utils.Emojis.timer} Times up! Better luck next time.`,
                embed: getPerformance()
            });
        msg.removeReactions().catch(() => { });
    });
    function getPerformance() {
        const correct = performance.filter((p) => p).length;
        const total = data.results.length;
        const average = Math.floor((correct / total) * 10);
        const grade = average > 8
            ? "`A` Exceptional"
            : average > 7
                ? "`B` Very Good"
                : average > 6
                    ? "`C` Good"
                    : average > 5
                        ? "`D` Average"
                        : average > 2
                            ? "`E` Poor"
                            : "`F` Worse";
        const embed = {
            author: {
                name: `${message.author.username}'s Performance`,
                icon_url: message.author.avatarURL
            },
            color: NewsCore.Utils.Colors.blurple.num,
            description: [
                `**Total Questions:** ${total}`,
                `**Correctly Answered:** ${correct}`,
                `**Total Marks:** ${correct}/${total}`,
                `**Average:** ${average * 10}%`,
                `**Grade:** ${grade}`
            ].join("\n")
        };
        return embed;
    }
    function getEmbed(question) {
        const embed = {
            title: html_entities_1.AllHtmlEntities.decode(question.question),
            color: NewsCore.Utils.Colors.blurple.num,
            fields: [
                {
                    name: "Options",
                    value: question.answers
                        .map((ans, i) => `\`${i + 1}\` ${html_entities_1.AllHtmlEntities.decode(ans)}`)
                        .join("\n")
                },
                {
                    name: "Information",
                    value: [
                        `**Catrgory:** ${question.category.toProperCase()}`,
                        `**Difficulty:** ${question.difficulty.toProperCase()}`,
                        `**Type:** ${question.type.toProperCase()}`
                    ].join("\n")
                }
            ],
            footer: {
                text: `Question #${current + 1} of ${data.results.length}`
            }
        };
        return embed;
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
