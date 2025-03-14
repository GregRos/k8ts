import { Kind, type Origin } from "@k8ts/instruments"
import type { Meta, MutableMeta } from "@k8ts/metadata"
import { Set } from "immutable"
import { BaseManifest, PreManifest, SOURCE } from "../manifest"
import { K8tsResources } from "../resources/kind-map"
import { TopResource } from "./top-resource"

export abstract class ManifestResource<Props extends object = object> extends TopResource<Props> {
    get isExternal() {
        return false
    }
    private static _constructed = Set<ManifestResource>()
    private static _register(self: ManifestResource) {
        this._constructed = this._constructed.add(self)
    }
    static getAllConstructed() {
        return this._constructed
    }
    abstract override readonly api: Kind.Kind
    readonly meta: MutableMeta
    constructor(origin: Origin, meta: Meta | MutableMeta, props: Props) {
        super(origin, meta.get("name"), props)
        this.meta = meta.toMutable()
        const self = this
        ;(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
            if (!K8tsResources.has(self.api.name) && !self.isExternal) {
                throw new Error(`No kind registered for ${self.api.name}`)
            }
        })()
    }

    protected metadata() {
        return {
            labels: this.meta.labels,
            annotations: this.meta.annotations,
            name: this.meta.get("name"),
            namespace: this.meta.tryGet("namespace")
        }
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }

    manifestIdents() {
        return {
            kind: this.api.name,
            apiVersion: this.api.version.text
        }
    }
    abstract manifestBody(): PreManifest

    manifest(): BaseManifest {
        return {
            ...(this.manifestBody() as any),
            ...this.manifestIdents(),
            [SOURCE]: this
        }
    }
}
