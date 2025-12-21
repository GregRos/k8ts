import { Meta } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import { type BaseManifest, type ManifestIdentFields, type ManifestMetadata } from "../../manifest"
import { Trace, TraceEmbedder } from "../../tracing"
import type { Origin_Entity } from "../origin/origin-entity"
import { OriginContextTracker } from "../origin/origin-runner"
import { ResourceEntity } from "./resource-node"
export abstract class ManifestResource<
    Name extends string = string,
    Props extends object = object
> extends ResourceEntity<Name, Props> {
    readonly _origin: Origin_Entity
    readonly meta: Meta
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

    protected __metadata__(): ManifestMetadata {
        const self = this
        return {
            name: self.meta.get("name"),
            namespace: self.meta.tryGet("namespace"),
            labels: self.meta.labels,
            annotations: self.meta.annotations
        }
    }

    protected __idents__(): ManifestIdentFields {
        return {
            kind: this.kind.name,
            apiVersion: this.kind.parent!.text
        }
    }

    protected abstract body(): Promise<object> | object

    protected async __manifest__(): Promise<BaseManifest> {
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
