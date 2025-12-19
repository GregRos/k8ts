import { Meta } from "@k8ts/metadata"
import StackTracey from "stacktracey"
import { ResourceEntity, type OriginEntity } from "../graph"
import { type BaseManifest, type ManifestIdentFields, type ManifestMetadata } from "../manifest"
import { Trace, TraceEmbedder } from "../tracing"
import { OriginStackRunner } from "./origin-stack"
export abstract class ManifestResource<
    Props extends object = object
> extends ResourceEntity<Props> {
    readonly _origin: OriginEntity
    readonly meta: Meta
    constructor(name: string, props: Props) {
        super(name, props)
        this.meta = Meta.make({
            name
        })
        const origins = OriginStackRunner.get()
        const lastOrigin = origins.current
        if (!lastOrigin) {
            throw new Error(
                `ManifestResource ${this.name} must be created within an OriginEntity context`
            )
        }
        this._origin = lastOrigin
        this._origin["__attach_resource__"](this)
        TraceEmbedder.add(this, new Trace(new StackTracey().slice(3)))
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
            ...(await this.body()),
            metadata: this.__metadata__()
        }
        return a
    }

    get namespace() {
        return this.meta.tryGet("namespace")
    }
}
