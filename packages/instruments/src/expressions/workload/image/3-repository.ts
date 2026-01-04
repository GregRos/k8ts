import { Image_Namespace } from "./2-namespace"
import { Image_Image, type Image } from "./4-image"
import type { JoinIfNotEmpty } from "./types"

export class Image_Repository<Text extends string = string> {
    private readonly _url: Text
    constructor(
        private readonly _registry: string,
        private readonly _namespace: string,
        private readonly _repository: string
    ) {
        const parts = []
        if (!this.namespace.isEmpty) {
            parts.push(this.namespace.toString())
        }
        parts.push(this._repository)
        this._url = parts.join("/") as Text
    }

    get namespace() {
        return new Image_Namespace(this._registry, this._namespace)
    }

    toString() {
        return this._url
    }

    tag<Tag extends string>(tag: Tag): Image<`${Text}:${Tag}`> {
        return new Image_Image<`${Text}:${Tag}`>(
            this._registry,
            this._namespace,
            this._repository,
            tag,
            ""
        )
    }

    digest<Digest extends string>(digest: Digest): Image<JoinIfNotEmpty<Text, "@", Digest>> {
        return new Image_Image(this._registry, this._namespace, this._repository, "", digest)
    }
}
export type ImageRepository<Text extends string = string> = Image_Repository<Text>
