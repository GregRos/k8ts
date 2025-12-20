import { displayers } from "../../../displayers"

export type JoinIfNotEmpty<A extends string, J extends string, B extends string> = A extends ""
    ? B
    : B extends ""
      ? A
      : `${A}${J}${B}`
@displayers({
    simple: s => s._url
})
export class ImageHost<Text extends string = string> {
    private readonly _url: Text
    constructor(source: Text) {
        this._url = source
    }

    author<Author extends string>(name: Author) {
        return new ImageAuthor<JoinIfNotEmpty<Text, "/", Author>>(this.toString(), name)
    }

    image<Image extends string>(name: Image) {
        return new BaseImage<JoinIfNotEmpty<Text, "/", Image>>(this.toString(), name)
    }

    get [Symbol.toStringTag]() {
        return this._url
    }
}
@displayers({
    simple: s => s._url
})
export class ImageAuthor<Text extends string = string> {
    private readonly _url: Text
    constructor(base: string, name: string) {
        this._url = base === "" ? (name as Text) : ([base, name].join("/") as Text)
    }

    image<Image extends string>(name: Image) {
        return new BaseImage<JoinIfNotEmpty<Text, "/", Image>>(this.toString(), name)
    }
}
@displayers({
    simple: s => {
        if (!s._base) {
            return s._name
        }
        return [s._base, s._name].join("/")
    }
})
export class BaseImage<Text extends string = string> {
    constructor(
        private readonly _base: string,
        private readonly _name: string
    ) {}

    tag<Tag extends string>(tag: Tag) {
        return new TaggedImage<JoinIfNotEmpty<Text, ":", Tag>>(this, tag)
    }
}
@displayers({
    simple: s => {
        const fam = s._family.toString()
        if (s._tag === "") {
            return fam
        }
        return [fam, s._tag].join(":")
    }
})
export class TaggedImage<Text extends string = string> {
    constructor(
        private readonly _family: BaseImage<string>,
        private readonly _tag: string
    ) {}
}

export namespace Image {
    export function author<Author extends string>(name: Author) {
        return new ImageHost("").author(name)
    }
    export function name<Name extends `${string}/${string}`>(name: Name) {
        return new ImageHost("").image(name)
    }

    export function host<Host extends string>(url: Host) {
        return new ImageHost(url)
    }
}
