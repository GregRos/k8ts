import { ImageRepository } from "./3-repository"

type ImagePartsObject<
    Base extends string = string,
    Tag extends string | undefined = string | undefined,
    Digest extends string | undefined = string | undefined
> = {
    rest: Base
    teg: Tag | undefined
    digest: Digest | undefined
}
type toImageParts<Text extends string> = Text extends `${infer A}:${infer B}@${infer C}`
    ? ImagePartsObject<A, B, C>
    : Text extends `${infer A}:${infer B}`
      ? ImagePartsObject<A, B, undefined>
      : Text extends `${infer A}@${infer C}`
        ? ImagePartsObject<A, undefined, C>
        : ImagePartsObject<Text, undefined, undefined>

type fromImageParts<P extends ImagePartsObject> =
    P extends ImagePartsObject<infer A, infer B, infer C>
        ? B extends string
            ? C extends string
                ? `${A}:${B}@${C}`
                : `${A}:${B}`
            : C extends string
              ? `${A}@${C}`
              : A
        : never

type ReplaceFieldType<In extends object, Field extends keyof In, NewType> = Omit<In, Field> & {
    [K in Field]: NewType
}

type Image_ReplaceOrAddTag<Text extends string, NewTag extends string> = fromImageParts<
    ReplaceFieldType<toImageParts<Text>, "teg", NewTag>
>

type Image_ReplaceOrAddDigest<Text extends string, NewDigest extends string> = fromImageParts<
    ReplaceFieldType<toImageParts<Text>, "digest", NewDigest>
>

export interface Image<Text extends string = string> {
    toString(): Text
    get repository(): ImageRepository<any>
    tag<Tag extends string = "">(tag: Tag): Image<Image_ReplaceOrAddTag<Text, Tag>>
    digest<Digest extends string = "">(
        digest: Digest
    ): Image<Image_ReplaceOrAddDigest<Text, Digest>>
}
export function Image<Text extends string = "">(
    registry: string,
    namespace: string,
    repository: string,
    tag?: string,
    digest?: string
) {
    return new _Image(registry, namespace, repository, tag ?? "", digest ?? "") as Image<Text>
}

class _Image implements Image<any> {
    private readonly _text: any
    constructor(
        readonly _registry: string,
        readonly _namespace: string,
        readonly _repository: string,
        readonly _tag: string,
        readonly _digest: string
    ) {
        const parts = [this.repository] as any[]
        if (this._tag) {
            parts.push(`:${this._tag}`)
        }
        if (this._digest) {
            parts.push(`@${this._digest}`)
        }
        this._text = parts.join("")
    }

    get repository() {
        return ImageRepository(this._registry, this._namespace, this._repository)
    }

    digest<Digest extends string>(digest: Digest): Image<any> {
        return new _Image(this._registry, this._namespace, this._repository, this._tag, digest)
    }

    tag<Tag extends string>(tag: Tag): Image<any> {
        return new _Image(this._registry, this._namespace, this._repository, tag, this._digest)
    }

    toString() {
        return this._text
    }
}
