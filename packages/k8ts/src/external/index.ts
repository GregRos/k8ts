import type { Kind, Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { ManifestResource } from "../node"

export class External<K extends Kind> extends ManifestResource {
    override get isExternal() {
        return true
    }
    constructor(
        origin: Origin,
        readonly api: K,
        name: string,
        namespace: string | undefined
    ) {
        super(
            origin,
            Meta.make({
                name,
                namespace
            }),
            {}
        )
    }

    manifestBody(): never {
        throw new Error("External resources cannot be manifested")
    }

    ref() {
        return {
            kind: this.api.name,
            name: this.name,
            namespace: this.namespace
        }
    }
}
