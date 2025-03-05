import { ReferenceKey, type InputReferenceKey } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"
import { K8tsResources } from "../resources/kind-map"

export abstract class Base<Props extends object = object> {
    abstract readonly kind: string
    get key() {
        return new ReferenceKey(this.kind, this.name)
    }
    constructor(
        readonly meta: Meta,
        readonly props: Props
    ) {
        const self = this
        ;(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
            if (!K8tsResources.has(self.kind)) {
                throw new Error(`No kind registered for ${self.kind}`)
            }
        })()
    }

    isMatch(spec: InputReferenceKey) {
        return this.key.equals(spec)
    }

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
