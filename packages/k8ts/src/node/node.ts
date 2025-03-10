import { RefKey, Traced, type Kind, type Origin } from "@k8ts/instruments"
import type { ManifestResource } from "./base"
import type { SubResource } from "./sub-resource"
export interface DependsOn {
    dependsOn: ManifestResource
    text: string
}

export abstract class BaseNode extends Traced {
    abstract readonly api: Kind.Identifier
    constructor(
        readonly origin: Origin,
        readonly name: string,
        readonly props: object
    ) {}

    get key() {
        return RefKey.make(this.api.name, this.name)
    }

    get dependsOn(): DependsOn[] {
        return []
    }

    get subResources(): SubResource[] {
        return []
    }
}
