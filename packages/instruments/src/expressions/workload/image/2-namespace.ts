import { display } from "../../../utils"
import { ImageRegistry } from "./1-host"
import { Image_Repository, type ImageRepository } from "./3-repository"
import type { JoinIfNotEmpty } from "./types"

@display({
    simple: s => s._url
})
export class Image_Namespace<Text extends string = string> {
    private readonly _url: Text
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
        this._url = parts.join("/") as Text
    }

    toString() {
        return this._url
    }

    get registry() {
        return ImageRegistry(this._registry)
    }

    get isEmpty() {
        return this.registry.isEmpty && this._namespace === ""
    }

    repo<Repo extends string = "">(name?: Repo): ImageRepository<JoinIfNotEmpty<Text, "/", Repo>> {
        return new Image_Repository(this._registry, this._namespace, name ?? "")
    }
}

export type ImageNamespace<Text extends string = string> = Image_Namespace<Text>
