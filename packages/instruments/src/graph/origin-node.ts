import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../displayers"
import type { KindMap } from "../kind-map"
import { BaseEntity, BaseNode } from "./base-node"
import { ResourceNode } from "./resource-node"
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
export class Origin extends BaseNode<Origin, OriginEntity> implements Iterable<ResourceNode> {
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
        return this._entity.resourceKinds
    }
    private _attached = [] as ResourceNode[]

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
        return this._attached
    }
}
export abstract class OriginEntity extends BaseEntity<Origin, OriginEntity> {
    abstract readonly alias: string | undefined
    abstract readonly resourceKinds: KindMap
    abstract meta: Meta
}
