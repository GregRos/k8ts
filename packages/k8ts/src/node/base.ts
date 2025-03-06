import { Api, ReferenceKey, type Origin } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"
import { K8tsResources } from "../resources/kind-map"

export abstract class Base<Props extends object = object> {
    abstract readonly api: Api.Kind
    get key() {
        return new ReferenceKey(this.api.kind, this.name)
    }
    constructor(
        readonly origin: Origin,
        readonly meta: Meta,
        readonly props: Props
    ) {
        const self = this
        this.__post_init__()
        ;(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
            if (!K8tsResources.has(self.api.kind)) {
                throw new Error(`No kind registered for ${self.api.kind}`)
            }
        })()
    }
    protected __post_init__() {}

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
