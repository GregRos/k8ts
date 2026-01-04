import { Meta } from "@k8ts/metadata"
import { DummyOrigin } from "../../origin/dummy"
import type { IdentKind } from "../api-kind"
import type { ResourceKey } from "../key"
import { Resource } from "../resource"
export class DummyResource<K extends IdentKind> extends Resource<string, any> {
    readonly meta = Meta.create()
    constructor(
        readonly key: ResourceKey<K>,
        props: any
    ) {
        super(key.name, props)

        this.meta.add({
            name: key.name,
            namespace: key.namespace,
            "#k8ts.org/no-emit": "true"
        })
    }

    protected __origin__() {
        return DummyOrigin.instance
    }
    get namespace() {
        return this.meta.tryGet("namespace")
    }

    get ident() {
        return this.key.kind
    }
}
