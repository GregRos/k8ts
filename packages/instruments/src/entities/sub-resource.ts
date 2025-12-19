import { ResourceEntity } from "../graph"

export abstract class SubResource<Props extends object = object> extends ResourceEntity<Props> {
    #parent: ResourceEntity
    constructor(parent: ResourceEntity, name: string, props: Props) {
        super(name, props)
        this.#parent = parent
    }

    protected __parent__(): ResourceEntity<object> {
        return this.#parent
    }

    protected __origin__() {
        return this.__parent__()["__origin__"]()
    }

    protected abstract __submanifest__(): object

    get namespace(): string | undefined {
        return this.__parent__()?.namespace
    }
}
