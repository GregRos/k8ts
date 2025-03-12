import { RefKey, Traced, type Kind, type Origin } from "@k8ts/instruments"
import type { SubResource } from "./sub-resource"
export interface DependsOn {
    resource: AbsResource
    text: string
}

export abstract class AbsResource<Props extends object = object> extends Traced {
    abstract readonly api: Kind.Identifier
    constructor(
        readonly origin: Origin,
        readonly name: string,
        readonly props: Props
    ) {
        super()
    }

    get shortFqn() {
        return [this.api.name, this.name].filter(Boolean).join("/")
    }

    get key() {
        return RefKey.make(this.api.name, this.name)
    }

    get dependencies(): DependsOn[] {
        return []
    }

    get subResources(): SubResource[] {
        return []
    }
}
