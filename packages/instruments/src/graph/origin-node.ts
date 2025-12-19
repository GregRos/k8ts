import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq, Seq } from "doddle"
import { displayers } from "../displayers"
import type { KindMap } from "../kind-map"
import { BaseEntity, BaseNode } from "./base-node"
import { ResourceNode, type ResourceEntity } from "./resource-node"
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

export abstract class OriginEntity extends BaseEntity<Origin, OriginEntity> {
    abstract readonly alias: string | undefined
    abstract readonly resourceKinds: KindMap
    abstract meta: Meta
    readonly _resources: ResourceEntity[] = []
    readonly _kids: OriginEntity[] = []
    protected __attach_kid__(kid: OriginEntity) {
        this._kids.push(kid)
    }

    protected __attach_resource__(resources: ResourceEntity | Iterable<ResourceEntity>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._resources.push(resource)
        }
    }
}
