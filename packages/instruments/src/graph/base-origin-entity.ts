import { Meta } from "@k8ts/metadata"
import chalk from "chalk"
import { doddle, Doddle } from "doddle"
import { Kind } from "../api-kind"
import { displayers } from "../displayers"
import { RefKey } from "../ref-key"
import { Origin, OriginEntity } from "./origin-node"
export interface OriginEntityProps {
    meta?: Meta.Input
}
@displayers({
    default: x => `[${x.shortFqn}]`,
    pretty(origin) {
        const kindPart = chalk.greenBright.bold(origin.kind.name)
        const originName = chalk.cyan(origin.name)
        return `〚${kindPart}/${originName}〛`
    }
})
export abstract class BaseOriginEntity<Props extends OriginEntityProps = OriginEntityProps>
    implements OriginEntity
{
    abstract readonly kind: Kind.Kind
    #node: Doddle<Origin>

    get node() {
        return this.#node.pull()
    }
    constructor(
        readonly name: string,
        readonly props: Props,
        parent: Origin | null
    ) {
        this.#node = doddle(() => new Origin(parent, this, RefKey.make(this.kind, name)))
    }
    get meta() {
        return Meta.make(this.props.meta)
    }
    get shortFqn() {
        return this.node.shortFqn
    }
}
