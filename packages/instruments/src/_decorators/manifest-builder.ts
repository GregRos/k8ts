import { MetadataEntity } from "../graph/node"
import {
    BaseManifest,
    ManifestIdentFields,
    ManifestMetadata,
    ManifestSourceEmbedder,
    PreManifest
} from "../manifest"
import { Embedder } from "./base"
import { AttachedTarget } from "./type-tools"

export namespace ManifestBuilder {
    export interface Out {
        body: () => PreManifest
        metadata: () => ManifestMetadata
        ident: () => ManifestIdentFields
        manifest: () => BaseManifest
    }

    export type In<Target extends MetadataEntity = MetadataEntity> = Partial<
        AttachedTarget<Out, Target>
    > & {
        body: (self: Target) => PreManifest
    } & {
        [key: string]: (self: Target, ...args: any[]) => any
    }
}

class BuilderDecorator {
    private _system = new Embedder<MetadataEntity, ManifestBuilder.In>("builder")

    implement(
        ctor: { new (...args: any[]): MetadataEntity },
        input: ManifestBuilder.In<MetadataEntity>
    ) {
        this._system.set(ctor.prototype, {
            ...input
        })
    }
    private _metadata(self: MetadataEntity) {
        return {
            labels: self.meta.labels,
            annotations: self.meta.annotations,
            name: self.meta.get("name"),
            namespace: self.meta.tryGet("namespace")
        }
    }

    private _idents(self: MetadataEntity) {
        return {
            kind: self.kind.name,
            apiVersion: self.kind.parent!.text
        }
    }

    manifest(trait: ManifestBuilder.Out, self: MetadataEntity) {
        const mani = {
            ...trait.body(),
            metadata: trait.metadata(),

            ...trait.ident()
        }
        ManifestSourceEmbedder.set(mani, self)
        return mani
    }

    idents(self: MetadataEntity) {
        return {
            kind: self.kind.name,
            apiVersion: self.kind.parent!.text
        }
    }
    get(target: MetadataEntity): ManifestBuilder.Out {
        const input = this._system.get(target)
        const o: ManifestBuilder.Out = {
            ident: () => input.ident?.call(o, target) ?? this._idents(target),
            metadata: () => input.metadata?.call(o, target) ?? this._metadata(target),
            body: () => input.body.call(o, target),
            manifest: () => this.manifest(o, target) as any
        }
        return o
    }

    get decorator() {
        return <Target extends new (...args: any[]) => MetadataEntity>(
            input: ManifestBuilder.In<InstanceType<Target>>
        ) => {
            return (ctor: Target) => {
                this.implement(ctor, input as any)
                return ctor
            }
        }
    }
}

export const Builder = new BuilderDecorator()

export const manifest = Builder.decorator

// writing the decorator itself
