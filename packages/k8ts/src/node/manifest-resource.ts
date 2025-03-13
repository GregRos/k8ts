import { Kind, type Origin } from "@k8ts/instruments"
import type { Meta, MutableMeta } from "@k8ts/metadata"
import { PreManifest } from "../manifest"
import { K8tsResources } from "../resources/kind-map"
import { TopResource } from "./top-resource"

export abstract class ManifestResource<Props extends object = object> extends TopResource<Props> {
    abstract override readonly api: Kind.Kind
    readonly meta: MutableMeta
    constructor(origin: Origin, meta: Meta | MutableMeta, props: Props) {
        super(origin, meta.get("name"), props)
        this.meta = meta.toMutable()
        const self = this
        ;(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
            if (!K8tsResources.has(self.api.name)) {
                throw new Error(`No kind registered for ${self.api.name}`)
            }
        })()
    }

    protected metadata() {
        return {
            labels: this.meta.labels,
            annotations: this.meta.annotations,
            name: this.meta.get("name"),
            namespace: this.meta.get("namespace")
        }
    }

    get namespace() {
        return this.meta.get("namespace")
    }
    abstract manifest(): PreManifest
}
