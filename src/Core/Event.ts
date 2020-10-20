import { Client } from "./Client";

export type EventExecute = (News: Client, ...args: any) => Promise<any> | any;

export class $Event {
    execute: EventExecute;

    constructor(execute: EventExecute) {
        this.execute = execute;
    }
}