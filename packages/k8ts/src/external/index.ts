import { Kind, Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { ManifestResource } from "../node"

export class External<K extends Kind> extends ManifestResource {
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
            { KIND: kind }
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
