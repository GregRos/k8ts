import { Kind, Resource_Entity, type Origin_Entity, type RefKey } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { MakeError } from "../../error"

export class External<
    K extends Kind.IdentParent = Kind.IdentParent,
    Name extends string = string
> extends Resource_Entity<Name> {
    meta = Meta.make()
    constructor(
        private readonly _origin: Origin_Entity,
        readonly key: RefKey<K, Name>,
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

    protected __origin__(): Origin_Entity {
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
