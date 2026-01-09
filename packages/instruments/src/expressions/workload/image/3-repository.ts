import { ImageNamespace } from "./2-namespace"
import { Image } from "./4-image"
import type { JoinIfNotEmpty } from "./types"

export interface ImageRepository<Text extends string = string> {
    toString(): Text
    get namespace(): ImageNamespace
    tag<Tag extends string = "">(tag?: Tag): Image<JoinIfNotEmpty<Text, ":", Tag>>
    digest<Digest extends string = "">(digest?: Digest): Image<JoinIfNotEmpty<Text, "@", Digest>>
}

export function ImageRepository<Text extends string = "">(
    registry: string,
    namespace: string,
    repository?: string
) {
    return new _ImageRepository(registry, namespace, repository ?? "") as ImageRepository<Text>
}

class _ImageRepository implements ImageRepository<any> {
    private readonly _url: string
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
        this._url = parts.join("/") as any
    }

    get namespace() {
        return ImageNamespace(this._registry, this._namespace)
    }

    toString(): any {
        return this._url
    }

    tag<Tag extends string>(tag?: Tag): Image<any> {
        return Image(this._registry, this._namespace, this._repository, tag, "")
    }

    digest<Digest extends string>(digest?: Digest): Image<any> {
        return Image(this._registry, this._namespace, this._repository, "", digest)
    }
}
