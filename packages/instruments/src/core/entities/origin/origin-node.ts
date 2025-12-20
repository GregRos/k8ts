import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../../../displayers"
import { type KindMapInput } from "../../kind-map"
import type { KindedCtor } from "../../reference"
import { BaseNode } from "../base-node"
import { ResourceNode } from "../resource/resource-node"
import type { OriginEntity } from "./origin-entity"
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
export class OriginNode
    extends BaseNode<OriginNode, OriginEntity>
    implements Iterable<ResourceNode>
{
    get kids() {
        return seq(this._entity["__kids__"]()).map(x => x.node)
    }
    get meta() {
        return this._entity.meta
    }

    constructor(entity: OriginEntity) {
        super(entity)
    }

    get resourceKinds() {
        return this._entity["__resource_kinds__"]()
    }

    get relations() {
        return seq([])
    }
    [Symbol.iterator]() {
        return this.resources[Symbol.iterator]()
    }
    readonly attachedTree: Seq<ResourceNode> = seq(() => {
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

    get resources() {
        return this._entity._resources.map(r => r.node)
    }
}

export interface Origin_Props<KindedCtors extends KindedCtor> {
    meta?: Meta.Input
    kinds?: KindMapInput<KindedCtors>
}
