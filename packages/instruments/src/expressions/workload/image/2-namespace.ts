import { display } from "../../../utils"
import { ImageRegistry } from "./1-host"
import { ImageRepository } from "./3-repository"
import type { JoinIfNotEmpty } from "./types"

export interface ImageNamespace<Text extends string = string> {
    toString(): Text
    isEmpty: boolean
    get registry(): ImageRegistry
    repo<Name extends string>(name?: Name): ImageRepository<JoinIfNotEmpty<Text, "/", Name>>
}
export function ImageNamespace<Text extends string = "">(registry: string, namespace?: Text) {
    return new _ImageNamespace(registry, namespace ?? "") as ImageNamespace<Text>
}
@display({
    simple: s => s._url
})
class _ImageNamespace implements ImageNamespace<any> {
    private readonly _url: string
    constructor(
        private readonly _registry: string,
        private readonly _namespace: string
    ) {
        const parts = []
        if (!this.registry.isEmpty) {
            parts.push(this.registry)
        }
        if (this._namespace !== "") {
            parts.push(this._namespace)
        }
        this._url = parts.join("/")
    }

    toString(): any {
        return this._url
    }

    get registry() {
        return ImageRegistry<any>(this._registry)
    }

    get isEmpty() {
        return this.registry.isEmpty && this._namespace === ""
    }

    repo<Repo extends string = "">(name?: Repo): ImageRepository<any> {
        return ImageRepository(this._registry, this._namespace, name ?? "")
    }
}
