import { displayers } from "@k8ts/instruments"
import chalk from "chalk"
import { AssemblyStage } from "./assembler"

@displayers({
    simple: s => s.text,
    pretty: attr => chalk.yellowBright(attr.text)
})
export class Attr {
    constructor(readonly text: string) {}
}
@displayers({
    simple: s => s.text,
    pretty: verb => chalk.bgGreen.bold.white(` ${verb.text} `)
})
export class Verb {
    constructor(readonly text: string) {}
}
@displayers({
    simple: s => s.text,
    pretty: stage => chalk.underline.bold.whiteBright(stage.text)
})
export class Stage {
    text: string
    constructor(private stage: AssemblyStage) {
        this.text = `${this._emoji} ${stage}`
    }

    private get _emoji() {
        switch (this.stage) {
            case "gathering":
                return "🛒"
            case "loading":
                return "🚚"
            case "manifesting":
                return "👻"
            case "saving":
                return "💾"
            case "serializing":
                return "🖨️"
            case "done":
                return "✅"
        }
    }
}
@displayers({
    simple: s => `${s.num} ${s.noun}`,
    pretty(self) {
        const { num, noun } = self
        const nounForm = num > 1 ? `${noun}s` : noun
        return `${chalk.red(num)} ${chalk.green(nounForm)}`
    }
})
export class Quantity {
    constructor(
        readonly num: number,
        readonly noun: string
    ) {}
}

@displayers({
    simple: s => s.name,
    pretty: refName => chalk.bgGrey.bold.white(` ${refName.name} `)
})
export class RefName {
    constructor(readonly name: string) {}
}
@displayers({
    simple: s => s.text,
    pretty: dest => chalk.blueBright(dest.text)
})
export class Dest {
    constructor(readonly text: string) {}
}

export function verb(verb: string) {
    return new Verb(verb)
}
export function attr(attr: string) {
    return new Attr(attr)
}
export function stage(stage: AssemblyStage) {
    return new Stage(stage)
}

export function quantity(num: number, noun: string) {
    return new Quantity(num, noun)
}

export function dest(text: string) {
    return new Dest(text)
}

export function ref(name: string) {
    return new RefName(name)
}
