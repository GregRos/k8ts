import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../../../utils/displayers"
import { Node } from "../node"
import type { ResourceRef, ResourceRef_Constructor } from "../resource"
import { Origin } from "./entity"
import { type KindMap_Input } from "./kind-map"

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
export class OriginNode extends Node<OriginNode, Origin> {
    get kids() {
        return seq(this.entity["__kids__"]()).map(x => x.assert(Origin).node)
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
    constructor(entity: Origin) {
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

export interface Origin_Props<
    KindedCtors extends ResourceRef_Constructor = ResourceRef_Constructor
> {
    meta?: Meta.Input
    kinds?: KindMap_Input<KindedCtors>
}
