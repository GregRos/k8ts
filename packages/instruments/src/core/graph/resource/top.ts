import { Metadata } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import {
    type K8tsManifest,
    type K8tsManifest_Ident,
    type K8tsManifest_Metadata
} from "../../manifest"
import { Trace_Source, TraceEmbedder } from "../../tracing"
import { K8tsGraphError } from "../error"
import type { Origin } from "../origin/origin"
import { OriginContextTracker } from "../origin/tracker"
import type { IdentKind } from "./api-kind"
import type { Resource_Props } from "./props"
import { Resource } from "./resource"

export abstract class ResourceTop<
    Name extends string = string,
    Props extends Resource_Props = Resource_Props
> extends Resource<Name, Props> {
    private readonly _origin: Origin
    readonly meta: Metadata
    abstract readonly ident: IdentKind

    get key() {
        return this.ident.refKey({ name: this.name, namespace: this.namespace })
    }
    get noEmit() {
        return this.meta.tryGet("#k8ts.org/no-emit", "") !== ""
    }
    set noEmit(v: boolean) {
        if (!v) {
            this.meta.delete("#k8ts.org/no-emit")
        } else {
            this.meta.add("#k8ts.org/no-emit", "true")
        }
    }
    constructor(name: Name, props: Props) {
        super(name, props)
        this.meta = new Metadata({
            name
        })
        const lastOrigin = OriginContextTracker.current
        if (!lastOrigin) {
            throw new K8tsGraphError(
                `Resource ${this.name} must be created within an Origin context`
            )
        }
        this._origin = lastOrigin
        this._origin["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace_Source(new StackTracey().slice(2)))
        if (this.props.$noEmit) {
            this.meta.add("#k8ts.org/no-emit", "true")
        }
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

    protected abstract __body__(): object

    protected async __manifest__(): Promise<K8tsManifest> {
        const a = {
            ...this.__idents__(),
            metadata: this.__metadata__(),
            ...(await this.__body__())
        }

        return a
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }
}
