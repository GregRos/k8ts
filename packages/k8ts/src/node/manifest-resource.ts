import { Builder, Kind, type Origin } from "@k8ts/instruments"
import type { Meta, MutableMeta } from "@k8ts/metadata"
import { TopResource } from "./top-resource"

export abstract class ManifestResource<Props extends object = object> extends TopResource<Props> {
    protected async manifest() {
        return Builder.get(this).manifest()
    }
    abstract override readonly kind: Kind.Kind
    readonly meta: MutableMeta
    constructor(origin: Origin, meta: Meta | MutableMeta, props: Props) {
        super(origin, meta.get("name"), props)
        this.meta = meta.toMutable()
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }
}
