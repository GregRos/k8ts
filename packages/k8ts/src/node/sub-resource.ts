import { Traced } from "@k8ts/instruments"
import type { Base, DependsOn } from "./base"

export abstract class SubResource extends Traced {
    abstract readonly kind: string
    constructor(
        readonly parent: Base,
        readonly name: string
    ) {
        super()
    }

    get dependsOn(): DependsOn[] {
        return []
    }
}
