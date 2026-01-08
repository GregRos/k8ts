import { Metadata } from "@k8ts/metadata"
import { doddle } from "doddle"
import { omit } from "lodash"
import StackTracey from "stacktracey"
import {
    type K8tsManifest,
    type K8tsManifest_GVK,
    type K8tsManifest_Metadata
} from "../../manifest"
import { Trace_Source, TraceEmbedder } from "../../tracing"
import { K8tsGraphError } from "../error"
import type { Origin } from "../origin/origin"
import { OriginContextTracker } from "../origin/tracker"
import type { Resource_Props_Top } from "./props"
import { Resource } from "./resource"
export interface ResourceTop_Origins {
    origin: Origin
    scopedOrigin: Origin
}
export abstract class ResourceTop<
    Name extends string = string,
    Props extends Resource_Props_Top = Resource_Props_Top
> extends Resource<Name, Props> {
    readonly metadata: Metadata
    private readonly _origins: ResourceTop_Origins
    constructor(name: Name, props: Props, originOptions?: Partial<ResourceTop_Origins>) {
        const ownOrigin = originOptions?.origin ?? OriginContextTracker.current
        if (!ownOrigin) {
            throw new K8tsGraphError(`Resource ${name} must be created within an Origin context`)
        }
        super(name, ownOrigin.namespace, props)
        this._origins = {
            origin: originOptions?.origin ?? ownOrigin,
            scopedOrigin: originOptions?.scopedOrigin ?? ownOrigin
        }
        this.metadata = new Metadata(props.$metadata).overwrite()

        this._origins.origin["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace_Source(new StackTracey().slice(2)))
    }

    protected __scope__<F extends (...args: any[]) => any>(fn: F): F {
        const bound = this._origins.scopedOrigin["__bind__"](fn)
        return bound
    }

    protected get __origin__() {
        return this._origins.origin
    }

    protected __metadata__(): K8tsManifest_Metadata {
        const self = this
        return {
            name: self.ident.name,
            namespace: self.ident.namespace,
            labels: self.metadata.labels,
            annotations: self.metadata.annotations
        }
    }

    protected __gvk__(): K8tsManifest_GVK {
        return {
            apiVersion: this.kind.parent!.url,
            kind: this.kind.value
        }
    }

    protected abstract __body__(): object

    protected __manifest__(): K8tsManifest | Promise<K8tsManifest> {
        return doddle(async () => {
            const body = await this.__body__()
            // We want the body to be after the metadata and the gvk
            // But we don't want it to override anything if it has extra keys
            const trimmedBody = omit(body, ["metadata", "apiVersion", "kind"])
            const a = {
                ...this.__gvk__(),
                metadata: this.__metadata__(),
                ...trimmedBody
            }
            this.__origin__["__emit__"]("resource/manifested", {
                origin: this.__origin__,
                manifest: a,
                resource: this
            })
            return a
        }).pull()
    }
}
