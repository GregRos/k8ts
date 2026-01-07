import { Metadata } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import {
    type K8tsManifest,
    type K8tsManifest_Ident,
    type K8tsManifest_Metadata
} from "../../manifest"
import { Trace_Source, TraceEmbedder } from "../../tracing"
import { K8tsGraphError } from "../error"
import { OriginExporter } from "../origin"
import type { Origin } from "../origin/origin"
import { OriginContextTracker } from "../origin/tracker"
import type { Resource_Props_Top } from "./props"
import { Resource } from "./resource"

export abstract class ResourceTop<
    Name extends string = string,
    Props extends Resource_Props_Top = Resource_Props_Top
> extends Resource<Name, Props> {
    private readonly _origin: Origin
    readonly metadata: Metadata

    constructor(name: Name, props: Props) {
        const lastOrigin = OriginContextTracker.current?.mustBe(OriginExporter)
        if (!lastOrigin) {
            throw new K8tsGraphError(`Resource ${name} must be created within an Origin context`)
        }
        super(name, lastOrigin.namespace, props)
        this.metadata = new Metadata(props.$metadata).overwrite()

        this._origin = lastOrigin
        this._origin["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace_Source(new StackTracey().slice(2)))
    }

    get noEmit() {
        return this.props.$noEmit ?? false
    }

    set noEmit(v: boolean) {
        this.props.$noEmit = v
    }

    protected __origin__() {
        return this._origin
    }

    protected __metadata__(): K8tsManifest_Metadata {
        const self = this
        return {
            name: self.key.name,
            namespace: self.key.namespace,
            labels: self.metadata.labels,
            annotations: self.metadata.annotations
        }
    }

    protected __idents__(): K8tsManifest_Ident {
        return {
            apiVersion: this.kind.parent!.url,
            kind: this.kind.value
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
}
