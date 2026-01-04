import type { IdentResourcePart } from "./api-kind"
import { Resource } from "./entity"
import type { Resource_Props } from "./props"

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

    protected abstract __submanifest__(): Props["$overrides"]

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    get namespace(): string | undefined {
        return this.__parent__().namespace
    }
}
