import type { InputMeta, Meta } from "@k8ts/metadata/."
import { clone } from "lodash"
import type { KindMap } from "../kind-map"

export abstract class UntypedBaseScope {
    constructor(private readonly _meta: Meta) {}

    protected _prepareMeta(name: string) {
        return this._meta.add("name", name)
    }
    child(mixin: InputMeta) {
        const mut = clone(this) as any
        mut._meta = this._meta.add(mixin)
        return mut
    }
    abstract get registered(): KindMap
}
