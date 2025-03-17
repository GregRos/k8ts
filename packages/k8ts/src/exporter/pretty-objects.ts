import { displayers } from "@k8ts/instruments"

export class Attr {
    constructor(readonly text: string) {}
}
export class Verb {
    constructor(readonly text: string) {}
}
export class Stage {
    constructor(readonly text: string) {}
}
@displayers({
    
})
export function verb(verb: string) {
    return new Verb(verb)
}
export function attr(attr: string) {
    return new Attr(attr)
}
export function stage(stage: string) {
    return new Stage(stage)
}
