export interface ManifestBuilderImpl {
    body(): PreManifest
    metadata(): {
        labels: { [key: string]: string }
        annotations: { [key: string]: string }
        name: string
        namespace: string | undefined
    }
}
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

export interface ManifestBuilderImpl {
    body(): PreManifest
    metadata(): {
        labels: { [key: string]: string }
        annotations: { [key: string]: string }
        name: string
        namespace: string | undefined
    }
}
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
