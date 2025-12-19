import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { doddlify } from "doddle"
import type { Kind } from "../api-kind"
import { displayers } from "../displayers"
import { KindMap, type KindMapInput } from "../kind-map"
import { Origin, OriginEntity } from "./origin-node"
export interface OriginEntityProps<Kinds extends Kind.IdentParent[] = Kind.IdentParent[]> {
    meta?: Meta.Input
    kinds?: KindMapInput<Kinds[number]>
    alias?: string
}
@displayers({
    simple: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind.name)
        const originName = chalk.cyan(origin.name)
        return `${kindPart}/${originName}`
    }
})
export abstract class BaseOriginEntity<
    Props extends OriginEntityProps = OriginEntityProps
> extends OriginEntity {
    meta: Meta
    get alias() {
        return this.props.alias ?? undefined
    }

    get node(): Origin {
        return new Origin(this)
    }
    constructor(
        readonly name: string,
        readonly props: Props
    ) {
        super()

        this.meta = Meta.make(props.meta ?? {})
    }
    @doddlify
    get resourceKinds() {
        return new KindMap(this.props.kinds ?? [])
    }
    get shortFqn() {
        return this.node.shortFqn
    }
}
