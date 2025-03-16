import { TraitDecorator } from "@k8ts/instruments/src/_traits/object-impl"
import { PreManifest } from "../manifest"
import { ManifestResource } from "../node"

export interface MetadataType {
    labels: Record<string, string>
    annotations: Record<string, string>
    name: string
    namespace: string | null
}
export interface IdentTypes {
    kind: string
    apiVersion: string
}
export interface BuilderInputTypes {
    body: PreManifest
    metadata?: MetadataType
    idents?: IdentTypes
}

export interface BuilderOutputTypes {
    body: PreManifest
    metadata: MetadataType
    idents: IdentTypes
}

const manager = new TraitDecorator<ManifestResource, BuilderInputTypes, BuilderOutputTypes>(
    "mnanifestBuilderImplementation",
    {
        body: x => x,
        metadata(x) {
            return {
                labels: this.meta.labels,
                annotations: this.meta.annotations,
                name: this.meta.get("name"),
                namespace: this.meta.tryGet("namespace") ?? null
            }
        },
        idents(x) {
            return {
                kind: this.kind.name,
                apiVersion: this.kind.version.text
            }
        }
    }
)
export abstract class ManifestBuilder {
    abstract get resource(): ManifestResource
    abstract body(): PreManifest
    metadata() {
        const { resource } = this
        return {
            labels: resource.meta.labels,
            annotations: resource.meta.annotations,
            name: resource.meta.get("name"),
            namespace: resource.meta.tryGet("namespace")
        }
    }

    manifest() {
        return {
            ...this.body(),
            ...this.idents(),
            [SOURCE]: this.resource
        }
    }

    idents() {
        const { resource } = this
        return {
            kind: resource.kind.name,
            apiVersion: resource.kind.version.text
        }
    }
}
