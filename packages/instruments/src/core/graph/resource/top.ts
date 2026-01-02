import { Meta } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import {
    type K8tsManifest,
    type K8tsManifest_Ident,
    type K8tsManifest_Metadata
} from "../../manifest"
import { Trace_SourceCode, TraceEmbedder } from "../../tracing"
import type { Origin } from "../origin/entity"
import { OriginContextTracker } from "../origin/tracker"
import type { IdentKind } from "./api-kind"
import { Resource } from "./entity"
export abstract class ResourceTop<
    Name extends string = string,
    Props extends object = object
> extends Resource<Name, Props> {
    private readonly _origin: Origin
    readonly meta: Meta
    abstract readonly ident: IdentKind

    get key() {
        return this.ident.refKey({ name: this.name, namespace: this.namespace })
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
        TraceEmbedder.add(this, new Trace_SourceCode(new StackTracey().slice(2)))
    }

    protected __origin__() {
        return this._origin
    }

    protected __metadata__(): K8tsManifest_Metadata {
        const self = this
        return {
            name: self.meta.get("name"),
            namespace: self.meta.tryGet("namespace"),
            labels: self.meta.labels,
            annotations: self.meta.annotations
        }
    }

    protected __idents__(): K8tsManifest_Ident {
        return {
            apiVersion: this.ident.parent!.text,
            kind: this.ident.name
        }
    }

    protected abstract body(): Promise<object> | object

    protected async __manifest__(): Promise<K8tsManifest> {
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
