import { Metadata } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { Display, display } from "../../../utils/mixin/display"
import { TraceEmbedder } from "../../tracing"
import { Formats } from "../entity"
import { K8tsGraphError } from "../error"
import { Vertex } from "../node"
import { OriginVertex } from "../origin/node"
import type { GVK } from "./api-kind"
import { ResourceKey } from "./key"
import type { ResourceRef_Constructor_For } from "./ref"
import type { Resource } from "./resource"

@display({
    simple: s => `[${s.shortFqn}]`,
    pretty(resource, format) {
        format ??= "global"

        let kindName = chalk.greenBright(resource.kind.value)
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
export class ResourceVertex extends Vertex<ResourceVertex, Resource> {
    get fullFqn() {
        return [this.kind.dns, this.namespace, this.name].filter(Boolean).join("/")
    }
    get key(): ResourceKey {
        return this.entity.key
    }
    get kind() {
        return this.entity.kind as GVK
    }

    get namespace() {
        return this.key.namespace
    }

    get trace() {
        return TraceEmbedder.get(this.entity)
    }

    get isExported() {
        return this.metadata?.tryGet("#k8ts.org/exported") ?? false
    }

    get metadata() {
        return "metadata" in this.entity ? (this.entity.metadata as Metadata) : undefined
    }

    get noEmit(): boolean {
        return "noEmit" in this.entity ? (this.entity.noEmit as boolean) : false
    }
    set noEmit(v: boolean) {
        if ("noEmit" in this.entity) {
            this.entity.noEmit = v
        } else {
            throw new K8tsGraphError(
                `Resource of type ${this.entity.constructor.name} does not support noEmit property`
            )
        }
    }

    when<EntityTypeCtor extends ResourceRef_Constructor_For>(
        type: EntityTypeCtor,
        fn: (entity: InstanceType<EntityTypeCtor>) => void
    ) {
        const entity = this.entity as InstanceType<EntityTypeCtor>
        if (entity instanceof type) {
            fn(entity)
        }
    }

    as<EntityType extends Resource>(type: ResourceRef_Constructor_For<EntityType>) {
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
            let current: OriginVertex | null = self.origin
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
    get name() {
        return this.entity.key.name
    }
    constructor(
        readonly origin: OriginVertex,
        readonly entity: Resource
    ) {
        super(entity)
    }
}
