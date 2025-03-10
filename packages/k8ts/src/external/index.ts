import type { Kind, Origin } from "@k8ts/instruments"
import { AbsResource } from "../node/node"

export class External<K extends Kind> extends AbsResource {
    constructor(
        origin: Origin,
        readonly api: K,
        name: string,
        readonly namespace: string | undefined
    ) {
        super(origin, name, {})
    }

    manifest() {
        return {
            kind: this.api.name,
            name: this.name,
            namespace: this.namespace
        }
    }
}
