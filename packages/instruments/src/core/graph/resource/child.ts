import { Resource_Entity } from "./entity"

export abstract class Resource_Child<Props extends object = object> extends Resource_Entity<
    string,
    Props
> {
    #parent: Resource_Entity
    constructor(parent: Resource_Entity, name: string, props: Props) {
        super(name, props)
        this.#parent = parent
    }

    protected __parent__(): Resource_Entity {
        return this.#parent
    }

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    get namespace(): string | undefined {
        return this.__parent__()?.namespace
    }
}
