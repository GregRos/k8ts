import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../../../displayers"
import { type KindMapInput } from "../../kind-map"
import type { KindedCtor, Refable } from "../../reference"
import { BaseNode } from "../base-node"
import type { Origin_Entity } from "./entity"

@displayers({
    simple: s => `[${s.shortFqn}]`,
    prefix: s => {
        return ""
    },
    pretty(origin, format) {
        const kindName = chalk.greenBright.bold(origin.kind.name)
        const resourceName = chalk.cyan(origin.name)
        const pref = this.prefix!()

        return chalk.underline(`${pref}${kindName}:${resourceName}`)
    }
})
export class OriginNode extends BaseNode<OriginNode, Origin_Entity> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.node)
    }
    get meta() {
        return this.entity.meta
    }
    get inheritedMeta(): Meta {
        const self = this
        return [this, ...this.ancestors]
            .map(x => x.meta.clone())
            .reduce((acc, meta) => acc.add(meta), Meta.make())
    }
    constructor(entity: Origin_Entity) {
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
    readonly attachedTree: Seq<Refable> = seq(() => {
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

export interface Origin_Props<KindedCtors extends KindedCtor = KindedCtor> {
    meta?: Meta.Input
    kinds?: KindMapInput<KindedCtors>
}
