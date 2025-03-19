import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { doddle, Doddle } from "doddle"
import { Kind } from "../api-kind"
import { displayers } from "../displayers"
import { RefKey } from "../ref-key"
import { Origin, OriginEntity } from "./origin-node"
export interface OriginEntityProps {
    meta?: Meta.Input
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
export abstract class BaseOriginEntity<Props extends OriginEntityProps = OriginEntityProps>
    implements OriginEntity
{
    abstract readonly kind: Kind.Kind
    #node: Doddle<Origin>

    meta: Meta
    get alias() {
        return this.props.alias ?? undefined
    }
    get node() {
        return this.#node.pull()
    }
    constructor(
        readonly name: string,
        readonly props: Props,
        parent: Origin | null
    ) {
        this.#node = doddle(() => new Origin(parent, this, RefKey.make(this.kind, name)))
        this.meta = Meta.make(props.meta)
    }
    get shortFqn() {
        return this.node.shortFqn
    }
}
