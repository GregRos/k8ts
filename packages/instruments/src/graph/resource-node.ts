import { MutableMeta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { displayers } from "../displayers"
import { RefKey } from "../ref-key"
import { BaseEntity, BaseNode, Formats } from "./base-node"
import { __CONNECTIONS } from "./connections"
import { Origin } from "./origin-node"

@displayers({
    default: s => `[${s.shortFqn}]`,
    pretty(resource) {
        const originPart = chalk.blueBright(resource.origin.name)
        const kindName = chalk.greenBright.bold(resource.kind.name)
        const resourceName = chalk.cyan(resource.name)
        return `〚${originPart}:${kindName}/${resourceName}〛`
    }
})
export class ResourceNode extends BaseNode<ResourceNode, ResourceEntity> {
    get needs() {
        return seq(this._connections.needs)
    }

    get meta() {
        return "meta" in this._entity ? (this._entity.meta as MutableMeta) : undefined
    }

    get isExternal() {
        return this.origins.some(x => x.name === "EXTERNAL").pull()
    }

    get origins() {
        const self = this
        return seq(function* () {
            let current: Origin | null = self.origin
            while (current) {
                yield current
                current = current.parent
            }
        })
    }

    get kids() {
        return seq(this._connections.kids)
    }
    override get isTopLevel() {
        return this.isExternal || this.parent == null
    }
    get parent() {
        return this._connections.parent()
    }

    override get shortFqn() {
        return `${this.origin.name}:${this.key}`
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
