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

    get shortName() {
        return [this.api.name, this.name].filter(Boolean).join("/")
    }

    get href() {
        return [this.api.text, this.namespace, this.name].filter(Boolean).join("/")
    }

    abstract get namespace(): string | undefined

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
