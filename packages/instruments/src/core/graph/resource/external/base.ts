import { Meta } from "@k8ts/metadata"
import { Origin_External } from "../../origin/external"
import type { Kind } from "../api-kind"
import { Rsc_Entity } from "../entity"
import type { RefKey } from "../ref-key"
export class External<K extends Kind.Ident_Like> extends Rsc_Entity<string, any> {
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
        return Origin_External.instance
    }
    get namespace() {
        return this.meta.tryGet("namespace")
    }

    get kind() {
        return this.key.kind
    }
}
