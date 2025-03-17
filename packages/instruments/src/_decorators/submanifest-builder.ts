import { ResourceEntity } from "../graph/node"
import { ManifestSourceEmbedder } from "../manifest"
import { Embedder } from "./base"
import { AttachedTarget } from "./type-tools"

export namespace SubManifestBuilder {
    export interface Out {
        manifest: () => object
    }

    export type In<Target extends ResourceEntity = ResourceEntity> = AttachedTarget<Out, Target> & {
        [key: string]: (self: Target, ...args: any[]) => any
    }
}

class SubManifestDecorator {
    private _system = new Embedder<ResourceEntity, SubManifestBuilder.In>("submanifest")

    implement(
        ctor: { new (...args: any[]): ResourceEntity },
        input: SubManifestBuilder.In<ResourceEntity>
    ) {
        this._system.set(ctor.prototype, {
            ...input
        })
    }

    manifest(trait: SubManifestBuilder.Out, self: ResourceEntity) {
        const m = trait.manifest()
        ManifestSourceEmbedder.set(m, self)
        return m
    }

    get(target: ResourceEntity): SubManifestBuilder.Out {
        const input = this._system.get(target)
        const o: SubManifestBuilder.Out = {
            manifest: () => input.manifest.call(input, target)
        }
        return o
    }

    get decorator() {
        return <Target extends new (...args: any[]) => ResourceEntity>(
            input: SubManifestBuilder.In<InstanceType<Target>>
        ) => {
            return (ctor: Target) => {
                this.implement(ctor, input as any)
                return ctor
            }
        }
    }
}

export const SubManifest = new SubManifestDecorator()

export const submanifest = SubManifest.decorator

// writing the decorator itself
