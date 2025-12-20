import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { displayers } from "../../../displayers"
import { KindMap } from "../../kind-map"
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
    readonly _resources: ResourceEntity[] = []
    readonly _kids: OriginEntity[] = []
    readonly meta: Meta

    get node(): OriginNode {
        return new OriginNode(this)
    }
    constructor(
        readonly name: string,
        readonly props: Props
    ) {
        super()

        this.meta = Meta.make(props.meta ?? {})
    }

    protected __resource_kinds__() {
        return new KindMap(this.props.kinds ?? [])
    }

    protected get shortFqn() {
        return this.node.shortFqn
    }

    protected __attach_kid__(kid: OriginEntity) {
        this._kids.push(kid)
    }

    protected __attach_resource__(resources: ResourceEntity | Iterable<ResourceEntity>) {
        resources = Symbol.iterator in resources ? resources : [resources]
        for (const resource of resources) {
            this._resources.push(resource)
        }
    }

    protected __bind__<F extends (...args: any[]) => any>(fn: F): F {
        const origin = this
        return OriginRunner.binder(origin).bind(fn)
    }
}
