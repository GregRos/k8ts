export type JoinIfNotEmpty<A extends string, J extends string, B extends string> = A extends ""
    ? B
    : B extends ""
      ? A
      : `${A}${J}${B}`
export class ImageHost<Text extends string = string> {
    private readonly _url: Text
    constructor(source: Text) {
        this._url = source
        this.toString = () => this[Symbol.toStringTag]
    }

    image<Image extends string>(name: Image) {
        return new BaseImage<JoinIfNotEmpty<Text, "/", Image>>(this, name)
    }

    get [Symbol.toStringTag]() {
        return this._url
    }
}

export class BaseImage<Text extends string = string> {
    constructor(
        private readonly _source: ImageHost,
        private readonly _name: string
    ) {
        this.toString = () => this[Symbol.toStringTag]
    }

    tag<Tag extends string>(tag: Tag) {
        return new TaggedImage<JoinIfNotEmpty<Text, ":", Tag>>(this, tag)
    }

    get [Symbol.toStringTag]() {
        if (this._source[Symbol.toStringTag] === "") {
            return this._name
        }
        return [this._source, this._name].join("/")
    }
}

export class TaggedImage<Text extends string = string> {
    constructor(
        private readonly _family: BaseImage<string>,
        private readonly _tag: string
    ) {
        this.toString = () => this.text
    }

    get text() {
        const fam = this._family[Symbol.toStringTag]
        if (this._tag === "") {
            return fam
        }
        return [fam, this._tag].join(":")
    }

    get [Symbol.toStringTag]() {
        return this.text
    }
}

export namespace Image {
    export function name<Name extends string>(name: Name) {
        return new ImageHost("").image(name)
    }

    export function host<Host extends string>(url: Host) {
        return new ImageHost(url)
    }
}
