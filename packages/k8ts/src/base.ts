import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"

export abstract class BaseNode<Props extends object> {
    abstract readonly kind: string
    constructor(
        readonly meta: Meta,
        readonly props: Props
    ) {}

    get name() {
        return this.meta.get("name")
    }

    setMeta(f: (m: Meta) => Meta) {
        const myClone = clone(this) as any
        myClone["meta"] = f(this.meta)
        return myClone
    }

    abstract manifest(): object
}
