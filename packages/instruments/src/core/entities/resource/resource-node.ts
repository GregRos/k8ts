import { Meta } from "@k8ts/metadata"
import { getDeepPropertyDescriptor } from "@k8ts/metadata/util"
import chalk from "chalk"
import { seq } from "doddle"
import { getNiceClassName, type AnyCtor } from "what-are-you"
import { Displayers, displayers } from "../../../displayers"
import { Kind } from "../../api-kind"
import { TraceEmbedder } from "../../tracing"
import { BaseEntity, BaseNode, Formats } from "../base-node"
import { type OriginEntity } from "../origin/origin-entity"
import { OriginNode } from "../origin/origin-node"

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
    get fullFqn() {
        return [this.kind.dns, this.namespace, this.name].filter(Boolean).join("/")
    }

    get namespace() {
        return this.meta?.tryGet("namespace")
    }

    get trace() {
        return TraceEmbedder.get(this._entity)
    }

    get isExported() {
        return this.meta?.tryGet("#k8ts.org/is-exported") ?? false
    }

    get meta() {
        return "meta" in this._entity ? (this._entity.meta as Meta) : undefined
    }

    get isExternal() {
        return this.origins.some(x => x.name === "EXTERNAL").pull()
    }

    when<EntityType extends ResourceEntity>(
        type: AnyCtor<EntityType>,
        fn: (entity: EntityType) => void
    ) {
        const entity = this._entity as EntityType
        if (entity instanceof type) {
            fn(entity)
        }
    }

    as<EntityType extends ResourceEntity>(type: AnyCtor<EntityType>) {
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
            let current: OriginNode | null = self.origin
            while (current) {
                yield current
                current = current.parent
            }
        })
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

    hasKind(kind: Kind.Identifier) {
        return this.kind.equals(kind)
    }
    constructor(
        readonly origin: OriginNode,
        readonly entity: ResourceEntity
    ) {
        super(entity)
    }
}

@displayers({
    simple: s => s.node,
    pretty: s => s.node
})
export abstract class ResourceEntity<
    Name extends string = string,
    Props extends object = object
> extends BaseEntity<ResourceNode, ResourceEntity> {
    abstract get kind(): Kind.IdentParent

    with(callback: (self: this) => void) {
        callback(this)
        return this
    }

    abstract readonly namespace: string | undefined

    protected constructor(
        readonly name: Name,
        readonly props: Props
    ) {
        super()

        this.name = name
        const desc = getDeepPropertyDescriptor(this, "kind")
        if (!desc || !desc.get) {
            throw new Error(
                `ResourceEntity subclass ${getNiceClassName(this)} must implement the 'kind' property as a getter, but it's missing or not a getter.`
            )
        }
    }

    protected abstract __origin__(): OriginEntity
    get node(): ResourceNode {
        return new ResourceNode(this.__origin__().node, this)
    }

    get shortFqn() {
        return [this.node.origin.name, [this.kind.name, this.name].filter(Boolean).join("/")].join(
            ":"
        )
    }
}
