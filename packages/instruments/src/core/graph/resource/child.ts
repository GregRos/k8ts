import type { Ident_ResourcePart } from "./api-kind"
import { Resource } from "./entity"

export abstract class ResourcePart<Props extends object = object> extends Resource<string, Props> {
    abstract get ident(): Ident_ResourcePart
    #parent: Resource
    constructor(parent: Resource, name: string, props: Props) {
        super(name, props)
        this.#parent = parent
    }

    protected __parent__(): Resource {
        return this.#parent
    }

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    get namespace(): string | undefined {
        return this.__parent__().namespace
    }
}
