import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../../../utils/displayers"
import { Node } from "../node"
import type { ResourceConstructor, ResourceRef } from "../resource"
import { OriginEntity } from "./entity"
import { type KindMapInput } from "./kind-map"

@displayers({
    simple: s => `[${s.shortFqn}]`,
    prefix: s => {
        return ""
    },
    pretty(origin, format) {
        const kindName = chalk.greenBright.bold(origin.ident)
        const resourceName = chalk.cyan(origin.name)
        const pref = this.prefix!()

        return chalk.underline(`${pref}${kindName}:${resourceName}`)
    }
})
export class OriginNode extends Node<OriginNode, OriginEntity> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.assert(OriginEntity).node)
    }
    get meta() {
        return this.entity.meta
    }
    get ident() {
        return this.entity.ident
    }
    get shortFqn() {
        return `${this.ident}/${this.name}`
    }
    get inheritedMeta(): Meta {
        const self = this
        return [this, ...this.ancestors]
            .map(x => x.meta.clone())
            .reduce((acc, meta) => acc.add(meta), Meta.make())
    }
    constructor(entity: OriginEntity) {
        super(entity)
    }

    get resourceKinds() {
        return this.entity["__resource_kinds__"]()
    }

    get relations() {
        return seq([])
    }

    get resources() {
        return this.entity.resources
    }
    readonly attachedTree: Seq<ResourceRef> = seq(() => {
        const self = this
        const desc = self.descendants
            .concatTo([this])
            .map(x => x)
            .concatMap(function* (x) {
                yield* self.resources
                for (const kid of self.kids) {
                    yield* kid.resources
                }
            })
        return desc
    }).cache()
}

export interface OriginProps<KindedCtors extends ResourceConstructor = ResourceConstructor> {
    meta?: Meta.Input
    kinds?: KindMapInput<KindedCtors>
}
