import { Kind, ResourceEntity, type OriginEntity, type RefKey } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { MakeError } from "../../error"

export class External<K extends Kind> extends ResourceEntity {
    meta = Meta.make()
    constructor(
        private readonly _origin: OriginEntity,
        readonly key: RefKey<K>,
        namespace: string | undefined = undefined
    ) {
        super(key.name, {})
        this.meta.overwrite("name", key.name)
        if (namespace) {
            this.meta.overwrite("namespace", namespace)
        }
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }

    get kind() {
        return this.key.kind
    }

    protected __origin__() {
        return this._origin
    }

    protected __parent__() {
        return undefined
    }

    protected body(): never {
        throw new MakeError("Cannot get body of External resource")
    }

    ref() {
        return {
            kind: this.kind.name,
            name: this.name,
            namespace: this.namespace
        }
    }
}
