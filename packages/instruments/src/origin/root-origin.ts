import type { Meta } from "@k8ts/metadata/."
import type { KindMap } from "../kind-map"
import { Origin } from "./base-origin"

export class RootOrigin extends Origin {
    constructor(
        name: string,
        universal: Meta,
        readonly registered: KindMap
    ) {
        super(name, universal)
    }
    override get parents() {
        return []
    }

    override toString() {
        return `>> ${this.name}`
    }
}
