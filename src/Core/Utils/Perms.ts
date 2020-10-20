import { Client } from "../Client";
import Eris from "eris";

export type LevelCondition = (member: Eris.Member) => boolean;

export class Level {
    name: string;
    level: number;
    condition: LevelCondition;

    constructor(name: string, level: number, condition: LevelCondition) {
        this.name = name;
        this.level = level;
        this.condition = condition;
    }
}

export class Permissions {
    News: Client;
    perms: string[];

    constructor(News: Client) {
        this.News = News;
        this.perms = Object.keys(Eris.Constants.Permissions);
    }

    getPerms(member: Eris.Member) {
        return Object.entries(member.permission.json).filter(p => p[1] === true).map(p => p[0]);
    }

    // getLevels(member: Eris.Member) {
    //     return this.levels.filter(l => l.condition(member));
    // }

    // topLevel(member: Eris.Member) {
    //     return this.getLevels(member).sort((a, b) => a.level - b.level).pop();
    // }

    // get levels() {
    //     return [
    //         new Level("owner", 10, (member: Eris.Member) => this.News.options.config.owners.includes(member.user.id))
    //     ]
    // }
}