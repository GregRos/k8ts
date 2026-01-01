import { Meta } from "@k8ts/metadata"
import { OriginExternal } from "../../origin/external"
import type { IdentKind } from "../api-kind"
import { Resource } from "../entity"
import type { RefKey } from "../ref-key"
export class External<K extends IdentKind> extends Resource<string, any> {
    readonly meta = Meta.make()
    constructor(
        readonly key: RefKey<K>,
        props: any
    ) {
        super(key.name, props)

        this.meta.add({
            name: key.name,
            namespace: key.namespace,
            "#k8ts.org/is-external": "true"
        })

        if (props.keys) {
            Object.defineProperties(this, {
                keys: {
                    get: () => props.keys
                }
            })
        }
    }

    protected __origin__() {
        return OriginExternal.instance
    }
    get namespace() {
        return this.meta.tryGet("namespace")
    }

    get ident() {
        return this.key.kind
    }
}
