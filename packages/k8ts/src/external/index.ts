import type { Kind, Origin, ResourceNodeImpl } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { ManifestResource } from "../node"

export class External<K extends Kind> extends ManifestResource {
    override get isExternal() {
        return true
    }
    override get impl(): ResourceNodeImpl {
        return {
            kids: [],
            parent: null,
            resource: this
        }
    }
    constructor(
        origin: Origin,
        readonly kind: K,
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
            kind: this.kind.name,
            name: this.name,
            namespace: this.namespace
        }
    }
}
