import type { InputMeta, Meta } from "@k8ts/metadata/."
import { clone } from "lodash"
import type { Base } from "../node/base"
import { Exports } from "./delayed"

export abstract class ParentScope {
    constructor(private readonly _meta: Meta) {}

    protected _prepareMeta(name: string) {
        return this._meta.add("name", name)
    }

    child(mixin: InputMeta) {
        const mut = clone(this) as any
        mut._meta = this._meta.add(mixin)
        return mut
    }

    scope<T extends Base>(generator: (scope: this) => Iterable<T>) {
        return Exports.make(this, generator(this))
    }
}
