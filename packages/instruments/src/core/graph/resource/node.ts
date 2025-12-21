import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { type AnyCtor } from "what-are-you"
import { Displayers, displayers } from "../../../utils/displayers"
import { TraceEmbedder } from "../../tracing"
import { Formats } from "../entity"
import { Node } from "../node"
import { OriginNode } from "../origin/node"
import type { Kind } from "./api-kind"
import type { Resource_Entity } from "./entity"
import { RefKey } from "./ref-key"

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
export class Resource_Node extends Node<Resource_Node, Resource_Entity> {
    get fullFqn() {
        return [this.kind.dns, this.namespace, this.name].filter(Boolean).join("/")
    }
    get key(): RefKey {
        return new RefKey(this.kind, this.name)
    }
    get kind() {
        return this.entity.kind
    }

    get namespace() {
        return this.meta?.tryGet("namespace")
    }

    get trace() {
        return TraceEmbedder.get(this.entity)
    }

    get isExported() {
        return this.meta?.tryGet("#k8ts.org/is-exported") ?? false
    }

    get meta() {
        return "meta" in this.entity ? (this.entity.meta as Meta) : undefined
    }

    get isExternal() {
        return this.origins.some(x => x.name === "EXTERNAL").pull()
    }

    when<EntityType extends Resource_Entity>(
        type: AnyCtor<EntityType>,
        fn: (entity: EntityType) => void
    ) {
        const entity = this.entity as EntityType
        if (entity instanceof type) {
            fn(entity)
        }
    }

    as<EntityType extends Resource_Entity>(type: AnyCtor<EntityType>) {
        const entity = this.entity as EntityType
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

    get shortFqn() {
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
        readonly entity: Resource_Entity
    ) {
        super(entity)
    }
}
