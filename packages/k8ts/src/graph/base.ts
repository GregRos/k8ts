import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"

export abstract class Base<Props extends object = object> {
    abstract readonly kind: string
    constructor(
        readonly meta: Meta,
        readonly props: Props
    ) {}

    get name() {
        return this.meta.get("name")
    }

    setMeta(f: (m: Meta) => Meta): this {
        const myClone = clone(this) as any
        myClone["meta"] = f(this.meta)
        return myClone
    }

    abstract manifest(): object
}

export abstract class Depends<
    Props extends object = object,
    Parent extends Base = Base
> extends Base<Props> {
    constructor(
        meta: Meta,
        props: Props,
        readonly dependency: Parent
    ) {
        super(meta, props)
    }
}
