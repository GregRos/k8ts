import { Meta } from "@k8ts/metadata"
import { DummyOrigin } from "../../origin/dummy-origin"
import type { IdentKind } from "../api-kind"
import { Resource } from "../resource"
import type { ResourceKey } from "../resource-key"
export class DummyResource<K extends IdentKind> extends Resource<string, any> {
    readonly meta = Meta.make()
    constructor(
        readonly key: ResourceKey<K>,
        props: any
    ) {
        super(key.name, props)

        this.meta.add({
            name: key.name,
            namespace: key.namespace,
            "#k8ts.org/is-external": "true"
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
