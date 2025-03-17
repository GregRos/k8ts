import { Meta } from "@k8ts/metadata/."
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"
import { Origin, OriginEntity } from "./origin-node"

export class ExternalOriginEntity implements OriginEntity {
    kind: Kind
    node: Origin
    get shortFqn() {
        return this.kind.name
    }
    readonly name = "EXTERNAL"
    readonly meta = Meta.make({
        "^should not be manifested": (() => {}) as any
    })
    constructor(parent: Origin, baseKind: Kind.Version) {
        this.kind = baseKind.kind("EXTERNAL")
        this.node = new Origin(parent, this, RefKey.make(this.kind, this.name))
    }
}
