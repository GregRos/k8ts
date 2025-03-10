import { Traced } from "@k8ts/instruments"
import type { ManifestResource } from "./base"
import type { DependsOn } from "./node"

export abstract class SubResource extends Traced {
    abstract readonly kind: string
    constructor(
        readonly parent: ManifestResource,
        readonly name: string
    ) {
        super()
    }

    get dependsOn(): DependsOn[] {
        return []
    }
}
