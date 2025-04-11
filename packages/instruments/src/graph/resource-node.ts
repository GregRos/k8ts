import { MutableMeta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { Kind } from "../api-kind"
import { Displayers, displayers, PrivateCtor } from "../displayers"
import { RefKey } from "../ref-key"
import { TraceEmbedder } from "../tracing"
import { BaseEntity, BaseNode, Formats } from "./base-node"
import { Origin } from "./origin-node"
import { Relations } from "./relations"

@displayers({
    simple: s => `[${s.shortFqn}]`,
    pretty(resource, format) {
        format ??= "global"

        let kindName = chalk.greenBright(resource.kind.name)
        if (format !== "lowkey") {
            kindName = chalk.bold(kindName)
        }
        const resourceName = chalk.blueBright(resource.name)
        const mainPart = `${kindName}/${resourceName}`
        let originPart = `${Displayers.get(resource.origin).prefix!()}`
        let text = ""

        text += mainPart
        if (format !== "local") {
            text = `${originPart}${text}`
        }
        if (format === "source") {
            text += ` (at ${resource.trace.format()})`
        }
        return text
    }
})
export class ResourceNode extends BaseNode<ResourceNode, ResourceEntity> {
    get relations() {
        return seq(this._relations.needs)
    }

    get fullFqn() {
        return [this.kind.dns, this.namespace, this.name].filter(Boolean).join("/")
    }

    get namespace() {
        return this.meta?.tryGet("namespace")
    }

    get trace() {
        return TraceEmbedder.get(this)
    }

    get isExported() {
        return this.meta?.tryGet("#k8ts.org/is-exported") ?? false
    }

    get meta() {
        return "meta" in this._entity ? (this._entity.meta as MutableMeta) : undefined
    }

    get isExternal() {
        return this.origins.some(x => x.name === "EXTERNAL").pull()
    }

    when<EntityType extends ResourceEntity>(
        type: PrivateCtor<EntityType>,
        fn: (entity: EntityType) => void
    ) {
        const entity = this._entity as EntityType
        if (entity instanceof type) {
            fn(entity)
        }
    }

    as<EntityType extends ResourceEntity>(type: PrivateCtor<EntityType>) {
        const entity = this._entity as EntityType
        if (entity instanceof type) {
            return entity
        }
        throw new Error(
            `This node is for an entity of type ${entity.constructor.name}, not ${type.name}`
        )
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
        return seq(this._relations.kids)
    }

    get parent() {
        return this._relations.parent()
    }

    override get shortFqn() {
        return `${this.origin.name}:${this.key}`
    }

    get localName() {
        return this.key.string
    }

    format(format: Formats) {
        return Displayers.get(this).pretty(format)
    }
    private get _relations() {
        return Relations.get(this._entity)
    }

    hasKind(kind: Kind.Identifier) {
        return this.kind.equals(kind)
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
