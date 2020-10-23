import * as NewsCore from "../Core";
import axios from "axios";
import Eris from "eris";
import _ from "lodash";
import { AllHtmlEntities as he } from "html-entities";

export const config: NewsCore.CommandConfig = {
    name: "trivia",
    aliases: ["tri", "quiz"],
    description: "Create an interesting Quiz that you can answer",
    usage: "[1-10]",
    example: ["", "5"],
    category: "Utils",
    available: "Any"
};

interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
    answers: string[];
}

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    const msg = await message.channel.createMessage("Fetching Trivias...");

    const amount = args[0] && !Number.isNaN(args[0]) ? parseInt(args[0]) : 5;

    const response = await axios.get(
        NewsCore.Constants.trivia.api + amount.toString()
    );

    const data: { results: TriviaQuestion[] } = response.data;

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

    data.results = data.results.map((q) => ({
        ...q,
        answers: _.shuffle([q.correct_answer, ...q.incorrect_answers])
    }));

    let current = 0;
    const numbers = { one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣" };
    const numAr = Object.values(numbers);
    const performance: boolean[] = [];

    msg.edit({
        content: "",
        embed: getEmbed(data.results[current])
    });
    numAr.forEach((e) => msg.addReaction(e).catch(() => {}));

    const reactor = new NewsCore.Utils.ReactionHandler(
        News.bot,
        msg,
        (userID) => userID === message.author.id,
        false,
        { maxMatches: 10, time: 1 * 60 * 1000 }
    );

    reactor.on("reacted", (reaction) => {
        if (numAr.includes(reaction.emoji.name)) {
            let currentQuestion = data.results[current];
            let emojiIndex = numAr.findIndex((e) => e === reaction.emoji.name);
            let choosenAnswer = currentQuestion.answers[emojiIndex];
            performance.push(choosenAnswer === currentQuestion.correct_answer);
            current += 1;
            if (data.results[current]) {
                msg.edit({ embed: getEmbed(data.results[current]) });
                msg.removeReaction(
                    reaction.emoji.name,
                    message.author.id
                ).catch(() => {});
            } else {
                msg.edit({ embed: getPerformance() });
                msg.removeReactions().catch(() => {});
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

        msg.removeReactions().catch(() => {});
    });

    function getPerformance() {
        const correct = performance.filter((p) => p).length;
        const total = data.results.length;
        const average = Math.floor((correct / total) * 10);
        const grade =
            average > 8
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

        const embed: Eris.EmbedOptions = {
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

    function getEmbed(question: TriviaQuestion) {
        const embed: Eris.EmbedOptions = {
            title: he.decode(question.question),
            color: NewsCore.Utils.Colors.blurple.num,
            fields: [
                {
                    name: "Options",
                    value: question.answers
                        .map((ans, i) => `\`${i + 1}\` ${he.decode(ans)}`)
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
};

export default new NewsCore.Command(config, execute);
