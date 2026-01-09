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
import { OriginContextTracker } from "../origin/tracker"
import type {
    ResourceTop_CreationOptions,
    ResourceTop_CreationOptions_Input
} from "./creation-options"
import type { Resource_Props_Top } from "./props"
import { Resource } from "./resource"
let globalEntityId = 1
export abstract class TopResource<
    Name extends string = string,
    Props extends Resource_Props_Top = Resource_Props_Top
> extends Resource<Name, Props> {
    readonly metadata: Metadata
    protected readonly _creation: ResourceTop_CreationOptions
    protected readonly __entity_id__ = (() => {
        return `${this.kind.value}_${this.ident.name}_${(globalEntityId++).toString(16)}`
    })()
    constructor(name: Name, props: Props, creationOptions?: ResourceTop_CreationOptions_Input) {
        const ownOrigin = creationOptions?.origins?.own ?? OriginContextTracker.current
        if (!ownOrigin) {
            throw new K8tsGraphError(`Resource ${name} must be created within an Origin context`)
        }
        super(name, ownOrigin.namespace, props)
        this._creation = {
            origins: {
                own: ownOrigin,
                subscope: creationOptions?.origins?.subscope ?? ownOrigin
            }
        }
        this.metadata = new Metadata(props.$metadata)
            .overwrite(creationOptions?.metadata)
            .overwrite({
                "^k8ts.org/entity-id": this.__entity_id__
            })

        this._creation.origins.own["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace_Source(new StackTracey().slice(2)))
    }

    protected __scope__<F extends (...args: any[]) => any>(fn: F): F {
        const bound = this._creation.origins.subscope["__bind__"](fn)
        return bound
    }

    protected get __origin__() {
        return this._creation.origins.own
    }

    protected get __metadata__(): K8tsManifest_Metadata {
        const self = this
        return {
            name: self.ident.name,
            namespace: self.ident.namespace,
            labels: self.metadata.labels,
            annotations: self.metadata.annotations
        }
    }

    protected get __gvk__(): K8tsManifest_GVK {
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
                ...this.__gvk__,
                metadata: this.__metadata__,
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
