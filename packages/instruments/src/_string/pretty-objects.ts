import { displayers } from "@k8ts/instruments"
import chalk from "chalk"

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

export function quantity(num: number, noun: string) {
    return new Quantity(num, noun)
}

export function dest(text: string) {
    return new Dest(text)
}

export function ref(name: string) {
    return new RefName(name)
}
