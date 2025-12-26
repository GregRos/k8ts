import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../../../utils/displayers"
import { Node } from "../node"
import type { Rsc_Ctor_Of, Rsc_Ref } from "../resource"
import type { Origin_Entity } from "./entity"
import { type KindMapInput } from "./kind-map"

@displayers({
    simple: s => `[${s.shortFqn}]`,
    prefix: s => {
        return ""
    },
    pretty(origin, format) {
        const kindName = chalk.greenBright.bold(origin.kind)
        const resourceName = chalk.cyan(origin.name)
        const pref = this.prefix!()

        return chalk.underline(`${pref}${kindName}:${resourceName}`)
    }
})
export class OriginNode extends Node<OriginNode, Origin_Entity> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.node)
    }
    get meta() {
        return this.entity.meta
    }
    get kind() {
        return this.entity.kind
    }
    get shortFqn() {
        return `${this.kind}/${this.name}`
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
    readonly attachedTree: Seq<Rsc_Ref> = seq(() => {
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

export interface Origin_Props<KindedCtors extends Rsc_Ctor_Of = Rsc_Ctor_Of> {
    meta?: Meta.Input
    kinds?: KindMapInput<KindedCtors>
}
