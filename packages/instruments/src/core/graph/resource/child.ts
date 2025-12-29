import type { Ident_Rsc_Part } from "./api-kind"
import { Rsc_Entity } from "./entity"

export abstract class Rsc_Part<Props extends object = object> extends Rsc_Entity<string, Props> {
    abstract get kind(): Ident_Rsc_Part
    #parent: Rsc_Entity
    constructor(parent: Rsc_Entity, name: string, props: Props) {
        super(name, props)
        this.#parent = parent
    }

    protected __parent__(): Rsc_Entity {
        return this.#parent
    }

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    get namespace(): string | undefined {
        return this.__parent__()?.namespace
    }
}
