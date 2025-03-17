import { Meta } from "@k8ts/metadata"
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"
import { Origin, OriginEntity } from "./origin-node"
export interface OriginEntityProps {
    meta?: Meta.Input
}

export abstract class BaseOriginEntity<Props extends OriginEntityProps = OriginEntityProps>
    implements OriginEntity
{
    abstract readonly kind: Kind.Kind
    node: Origin

    constructor(
        readonly name: string,
        readonly props: Props,
        parent: Origin | null
    ) {
        this.node = new Origin(parent, this, RefKey.make(this["kind"], name))
    }
    get meta() {
        return Meta.make(this.props.meta)
    }
    get shortFqn() {
        return this.node.shortFqn
    }
}
