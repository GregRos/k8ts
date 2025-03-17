import { displayers } from "@k8ts/instruments"
import chalk from "chalk"

@displayers({
    default: s => s.text,
    pretty: attr => chalk.yellowBright(attr.text)
})
export class Attr {
    constructor(readonly text: string) {}
}
@displayers({
    default: s => s.text,
    pretty: verb => chalk.magentaBright.bold.italic(verb.text)
})
export class Verb {
    constructor(readonly text: string) {}
}
@displayers({
    default: s => s.text,
    pretty: stage => chalk.bold.bgCyanBright(stage.text)
})
export class Stage {
    constructor(readonly text: string) {}
}

export function verb(verb: string) {
    return new Verb(verb)
}
export function attr(attr: string) {
    return new Attr(attr)
}
export function stage(stage: string) {
    return new Stage(stage)
}
