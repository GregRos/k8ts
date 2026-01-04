import type { IdentResourcePart } from "./api-kind"
import type { Resource_Props } from "./props"
import { Resource } from "./resource"

export abstract class ResourcePart<Props extends Resource_Props = Resource_Props> extends Resource<
    string,
    Props
> {
    abstract get ident(): IdentResourcePart
    #parent: Resource
    constructor(parent: Resource, name: string, props: Props) {
        super(name, props)
        this.#parent = parent
    }

    protected __parent__(): Resource {
        return this.#parent
    }

    protected abstract __submanifest__(): object

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    get namespace(): string | undefined {
        return this.__parent__().namespace
    }
}
