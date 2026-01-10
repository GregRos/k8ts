import { ImageNamespace } from "./2-namespace"
import { ImageRepository } from "./3-repository"
import type { JoinIfNotEmpty } from "./types"

export interface ImageRegistry<Text extends string = string> {
    toString(): Text
    isEmpty: boolean
    repo<Name extends string = "">(name?: Name): ImageRepository<JoinIfNotEmpty<Text, "/", Name>>
    namespace<Ns extends string = "">(namespace?: Ns): ImageNamespace<JoinIfNotEmpty<Text, "/", Ns>>
}
export function ImageRegistry<Text extends string = "">(registry?: Text) {
    return new _ImageRegistry(registry ?? "") as ImageRegistry<Text>
}
class _ImageRegistry implements ImageRegistry<string> {
    constructor(readonly _registry: string) {}
    toString(): any {
        return this._registry
    }

    get isEmpty() {
        return this._registry === ""
    }

    repo(name?: string) {
        return ImageRepository<any>(this._registry, "", name ?? "")
    }

    namespace<Ns extends string = "">(namespace?: Ns) {
        return ImageNamespace<any>(this._registry, namespace ?? "")
    }
}
