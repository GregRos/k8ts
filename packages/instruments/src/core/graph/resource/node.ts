import { Metadata } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { type AnyCtor } from "what-are-you"
import { Display, display } from "../../../utils/mixin/display"
import { TraceEmbedder } from "../../tracing"
import { Formats } from "../entity"
import { K8tsGraphError } from "../error"
import { Node } from "../node"
import { OriginNode } from "../origin/node"
import type { IdentKind, IdentLike } from "./api-kind"
import { ResourceKey } from "./key"
import type { Resource } from "./resource"

@display({
    simple: s => `[${s.shortFqn}]`,
    pretty(resource, format) {
        format ??= "global"

        let kindName = chalk.greenBright(resource.ident.name)
        if (format !== "lowkey") {
            kindName = chalk.bold(kindName)
        }
        const parts = [kindName]
        if (resource.namespace) {
            parts.push(chalk.yellowBright(resource.namespace))
        }
        parts.push(chalk.blueBright(resource.name))
        const mainPart = parts.join("/")
        let originPart = `${Display.get(resource.origin).prefix!()}`
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
export class ResourceNode extends Node<ResourceNode, Resource> {
    get fullFqn() {
        return [this.ident.dns, this.namespace, this.name].filter(Boolean).join("/")
    }
    get key(): ResourceKey {
        return new ResourceKey(this.ident, {
            name: this.name,
            namespace: this.namespace
        })
    }
    get ident() {
        return this.entity.ident as IdentKind
    }

    get namespace() {
        return this.meta?.tryGet("namespace")
    }

    get trace() {
        return TraceEmbedder.get(this.entity)
    }

    get isExported() {
        return this.meta?.tryGet("#k8ts.org/exported") ?? false
    }

    get meta() {
        return "meta" in this.entity ? (this.entity.meta as Metadata) : undefined
    }

    get noEmit() {
        return this.meta?.tryGet("#k8ts.org/no-emit") ?? false
    }

    when<EntityType extends Resource>(type: AnyCtor<EntityType>, fn: (entity: EntityType) => void) {
        const entity = this.entity as EntityType
        if (entity instanceof type) {
            fn(entity)
        }
    }

    as<EntityType extends Resource>(type: AnyCtor<EntityType>) {
        const entity = this.entity as EntityType
        if (entity instanceof type) {
            return entity
        }
        throw new K8tsGraphError(
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
        return Display.get(this).pretty(format)
    }

    hasIdent(ident: IdentLike) {
        return this.ident.equals(ident)
    }
    constructor(
        readonly origin: OriginNode,
        readonly entity: Resource
    ) {
        super(entity)
    }
}
