import type { GVK_Base } from "./api-kind"
import type { Resource_Props } from "./props"
import { Resource } from "./resource"

export abstract class ResourcePart<Props extends Resource_Props = Resource_Props> extends Resource<
    string,
    Props
> {
    abstract get kind(): GVK_Base
    #parent: Resource
    constructor(parent: Resource, name: string, props: Props) {
        const parentNs = parent.key.namespace

        super(name, parentNs, props)
        this.#parent = parent
    }

    protected __parent__(): Resource {
        return this.#parent
    }

    protected abstract __submanifest__(): object

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }
}
