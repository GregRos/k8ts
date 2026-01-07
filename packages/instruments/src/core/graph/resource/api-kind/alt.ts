import type { JoinIfNotEmpty } from "../../../../expressions"
import { pluralize } from "./pluralize"
type _alphabeta = "alpha" | "beta" | ""
type _subversion = `${_alphabeta}${number}` | ""
type _version = `v${number}${_subversion | ""}`
export abstract class GVK_Base<Url extends string = string> {
    constructor(readonly url: Url) {}
    abstract get value(): string
    abstract get parent(): GVK_Base | null
    get parts(): GVK_Base[] {
        const parts: GVK_Base[] = []
        let curr: GVK_Base | null = this
        while (curr) {
            parts.unshift(curr)
            curr = curr.parent
        }
        return parts
    }
    get dns() {
        return this.parts
            .map(p => p.value)
            .filter(Boolean)
            .join(".")
    }

    equals(other: any) {
        if (other instanceof GVK_Group) {
            return this.url === other.url
        }
        if (typeof other === "string") {
            return this.url === other
        }
        return false
    }
}

export class GVK_Group<Group extends string> extends GVK_Base<Group> {
    get parts() {
        return [this]
    }
    get parent() {
        return null
    }
    get value(): Group {
        return this.url
    }

    version<Version extends _version>(version: Version) {
        return new GVK_Version(`${this.url}/${version}` as JoinIfNotEmpty<Group, "/", Version>)
    }
}

export class GVK_Version<Url extends string> extends GVK_Base<Url> {
    get parent() {
        return new GVK_Group(this.url.split("/")[0] as string)
    }

    get value(): Url extends `${string}/${infer V}` ? V : Url extends `v${string}` ? Url : never {
        return this.url.split("/")[1] as any
    }

    kind<Kind extends string>(kind: Kind, customPlural?: string) {
        return new GVK(`${this.url}/${kind}` as `${Url}/${Kind}`, customPlural)
    }
}

export class GVK<Url extends string> extends GVK_Base<Url> {
    constructor(
        url: Url,
        private _customPlural?: string
    ) {
        super(url)
    }
    get parent() {
        const stringParts = this.url.split("/").slice(0, -1)
        return new GVK_Version<string>(stringParts.join("/") as string)
    }

    get dns() {
        const parents = this.parent.parts.map(x => x.value)
        parents.push(this._customPlural ?? pluralize(this.value))
        return parents.join(".")
    }

    get value(): Url extends `${string}/${string}/${infer K}`
        ? K
        : Url extends `v${string}/${infer K}`
          ? K
          : never {
        return this.url.split("/").at(-1) as any
    }

    subKind<SubKind extends string>(subKind: SubKind) {
        return new GVK_SubKind<`${Url}.${SubKind}`>(`${this.url}.${subKind}` as `${Url}.${SubKind}`)
    }
}

export class GVK_SubKind<Url extends string> extends GVK_Base<Url> {
    get parent() {
        const [group, version, kind] = this.url.split("/")
        return new GVK<`${string}/${string}`>(
            `${group}/${version}/${kind}` as `${string}/${string}`
        )
    }

    get value(): Url extends `${string}.${infer Sk}` ? Sk : never {
        return this.url.split("/").at(-1) as any
    }

    subKind<SubKind extends string>(subKind: SubKind) {
        return new GVK_SubKind<`${Url}.${SubKind}`>(`${this.url}.${subKind}` as `${Url}.${SubKind}`)
    }
}
