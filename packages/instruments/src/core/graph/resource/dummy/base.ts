import { Metadata } from "@k8ts/metadata"
import { DummyOrigin } from "../../origin/dummy"
import type { IdentKind } from "../api-kind"
import type { ResourceKey } from "../key"
import { Resource } from "../resource"
export class DummyResource<K extends IdentKind> extends Resource<string, any> {
    readonly metadata = new Metadata()
    constructor(
        readonly key: ResourceKey<K>,
        props: any
    ) {
        super(key.name, props)

        this.metadata.add({
            name: key.name,
            namespace: key.namespace,
            "#k8ts.org/no-emit": "true"
        })
    }

    protected __origin__() {
        return DummyOrigin.instance
    }
    get namespace() {
        return this.metadata.tryGet("namespace")
    }

    get ident() {
        return this.key.kind
    }
}
