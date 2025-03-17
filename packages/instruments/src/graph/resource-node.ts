import { MutableMeta } from "@k8ts/metadata"
import { seq } from "doddle"
import { __CONNECTIONS } from "../_decorators"
import { RefKey } from "../ref-key"
import { BaseEntity, BaseNode, Formats } from "./base-node"
import { Origin } from "./origin-node"

export class ResourceNode extends BaseNode<ResourceNode, ResourceEntity> {
    get needs() {
        return seq(this._connections.needs)
    }

    get kids() {
        return seq(this._connections.kids)
    }

    get parent() {
        return this._connections.parent()
    }

    format(format: Formats) {
        switch (format) {
            case "short":
                return this.name
            case "fqn":
                return this.key.string
            case "shortFqn":
                return this.key.name
        }
    }
    private get _connections() {
        return __CONNECTIONS.get(this._entity)
    }
    constructor(
        readonly origin: Origin,
        readonly entity: ResourceEntity,
        readonly key: RefKey
    ) {
        super(entity)
    }
}
export interface MetadataEntity extends BaseEntity<ResourceNode> {
    meta: MutableMeta
}
export interface ResourceEntity extends BaseEntity<ResourceNode> {}
