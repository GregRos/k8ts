import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { seq } from "doddle"
import { displayers } from "../../../displayers"
import { KindMap } from "../../kind-map"
import type { Refable, RefKey } from "../../reference"
import { BaseEntity } from "../base-node"
import type { ResourceEntity } from "../resource/resource-node"
import { type Origin_Props, OriginNode } from "./origin-node"
import { OriginRunner } from "./origin-runner"

@displayers({
    simple: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind.name)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class OriginEntity<Props extends Origin_Props = Origin_Props> extends BaseEntity<
    OriginNode,
    OriginEntity
> {
    private readonly _resources: ResourceEntity[] = []
    private readonly _kids: OriginEntity[] = []
    readonly meta: Meta

    get node(): OriginNode {
        return new OriginNode(this)
    }
    constructor(
        readonly name: string,
        protected readonly _props: Props
    ) {
        super()

        this.meta = Meta.make(_props.meta ?? {})
    }

    protected __resource_kinds__(): KindMap {
        const parentKindsIfAny = this.__parent__()?.__resource_kinds__() ?? []
        return new KindMap([...(this._props.kinds ?? []), ...parentKindsIfAny])
    }

    get shortFqn() {
        return this.node.shortFqn
    }

    __attach_kid__(kid: OriginEntity) {
        this._kids.push(kid)
    }

    find(refKey: RefKey) {
        for (const resource of this._resources) {
            if (resource.node.key.equals(refKey)) {
                return resource
            }
        }
        throw new Error(`Resource with key ${refKey.toString()} not found in Origin ${this.name}`)
    }

    __attach_resource__(resources: ResourceEntity | Iterable<ResourceEntity>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._resources.push(resource)
        }
    }

    __kids__(): Iterable<OriginEntity> {
        return this._kids
    }

    __bind__<F extends (...args: any[]) => any>(fn: F): F {
        const origin = this
        return OriginRunner.binder(origin).bind(fn)
    }

    // We don't cache this because resources can be added dynamically
    get resources(): Iterable<Refable> {
        const self = this
        return seq(function* () {
            for (const resource of self._resources) {
                yield resource
            }
            for (const kid of self._kids) {
                yield* kid.resources
            }
        })
    }
}
