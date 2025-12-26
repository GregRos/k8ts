import { Meta } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import { type Manifest, type Manifest_Ident, type Manifest_Metadata } from "../../manifest"
import { Trace, TraceEmbedder } from "../../tracing"
import type { Origin_Entity } from "../origin/entity"
import { OriginContextTracker } from "../origin/tracker"
import type { Kind } from "./api-kind"
import { Resource_Entity } from "./entity"
export abstract class Resource_Top<
    Name extends string = string,
    Props extends object = object
> extends Resource_Entity<Name, Props> {
    private readonly _origin: Origin_Entity
    readonly meta: Meta
    abstract readonly kind: Kind.Kind

    get key() {
        return this.kind.refKey({ name: this.name, namespace: this.namespace })
    }
    get disabled() {
        return this.meta.tryGet("#k8ts.org/disabled", "") !== ""
    }
    set disabled(v: boolean) {
        if (!v) {
            this.meta.delete("#k8ts.org/disabled")
        } else {
            this.meta.add("#k8ts.org/disabled", "true")
        }
    }
    constructor(name: Name, props: Props) {
        super(name, props)
        this.meta = Meta.make({
            name
        })
        const lastOrigin = OriginContextTracker.current
        if (!lastOrigin) {
            throw new Error(
                `ManifestResource ${this.name} must be created within an OriginEntity context`
            )
        }
        this._origin = lastOrigin
        this._origin["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace(new StackTracey().slice(2)))
    }

    protected __origin__() {
        return this._origin
    }

    protected __metadata__(): Manifest_Metadata {
        const self = this
        return {
            name: self.meta.get("name"),
            namespace: self.meta.tryGet("namespace"),
            labels: self.meta.labels,
            annotations: self.meta.annotations
        }
    }

    protected __idents__(): Manifest_Ident {
        return {
            apiVersion: this.kind.parent!.text,
            kind: this.kind.name
        }
    }

    protected abstract body(): Promise<object> | object

    protected async __manifest__(): Promise<Manifest> {
        const a = {
            ...this.__idents__(),
            metadata: this.__metadata__(),
            ...(await this.body())
        }

        return a
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }
}
