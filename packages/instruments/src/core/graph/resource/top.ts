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
import type { GVK } from "./api-kind"
import type { Resource_Props_Top } from "./props"
import { Resource } from "./resource"

export abstract class ResourceTop<
    Name extends string = string,
    Props extends Resource_Props_Top = Resource_Props_Top
> extends Resource<Name, Props> {
    private readonly _origin: Origin
    readonly metadata: Metadata
    abstract readonly ident: GVK

    get key() {
        return this.ident.refKey({ name: this.name, namespace: this.namespace })
    }

    constructor(name: Name, props: Props) {
        super(name, props)
        this.metadata = new Metadata({
            name
        }).overwrite(props.$metadata)
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
            this.metadata.add("#k8ts.org/no-emit", "true")
        }
    }

    protected __origin__() {
        return this._origin
    }

    protected __metadata__(): K8tsManifest_Metadata {
        const self = this
        return {
            name: self.metadata.get("name"),
            namespace: self.metadata.tryGet("namespace"),
            labels: self.metadata.labels,
            annotations: self.metadata.annotations
        }
    }

    protected __idents__(): K8tsManifest_Ident {
        return {
            apiVersion: this.ident.parent!.url,
            kind: this.ident.value
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
        return this.metadata.tryGet("namespace")
    }
}
