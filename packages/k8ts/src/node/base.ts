import { Kind, type Origin } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"
import { K8tsResources } from "../resources/kind-map"
import { AbsResource } from "./node"

export function dependencies(record: Record<string, ManifestResource>) {
    return Object.entries(record).map(([text, dependsOn]) => ({ dependsOn, text }))
}

export abstract class ManifestResource<Props extends object = object> extends AbsResource {
    abstract override readonly api: Kind.Kind

    constructor(
        origin: Origin,
        readonly meta: Meta,
        override readonly props: Props
    ) {
        super(origin, meta.get("name"), props)
        const self = this
        ;(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
            if (!K8tsResources.has(self.api.name)) {
                throw new Error(`No kind registered for ${self.api.name}`)
            }
        })()
    }

    setMeta(f: (m: Meta) => Meta): this {
        const myClone = clone(this) as any
        myClone["meta"] = f(this.meta)
        return myClone
    }

    abstract manifest(): object
}
