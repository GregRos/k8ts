import { ResourceIdent, type ResourceIdent_Options } from "../ident"
import { Gvk_Base } from "./0-base"
import { Gvk_Version } from "./2=version"
import { Gvk_SubKind } from "./4-subkind"

export class Gvk<Url extends string = string> extends Gvk_Base<Url> {
    constructor(
        url: Url,
        private _customPlural?: string
    ) {
        super(url)
    }
    get parent() {
        const stringParts = this.url.split("/").slice(0, -1)
        return new Gvk_Version<string>(stringParts.join("/") as string)
    }

    get plural() {
        return this._customPlural ?? pluralize(this.value)
    }

    refKey<Name extends string>(options: ResourceIdent_Options<Name>) {
        return new ResourceIdent<this, Name>(this as any, options)
    }

    get dns() {
        const parents = this.parent.parts.map(x => x.value)
        parents.push(this.plural)
        return parents.join(".")
    }

    get value(): Url extends `${string}/${string}/${infer K}`
        ? K
        : Url extends `v${string}/${infer K}`
          ? K
          : never {
        return this.url.split("/").at(-1) as any
    }

    subkind<SubKind extends string>(subKind: SubKind) {
        return new Gvk_SubKind<`${Url}.${SubKind}`>(`${this.url}.${subKind}` as `${Url}.${SubKind}`)
    }
}

export function pluralize(word: string): string {
    if (["s", "sh", "ch", "x", "z", "ro"].some(suffix => word.endsWith(suffix))) {
        return `${word}es`
    }
    if (["ay", "ey", "iy", "oy", "uy"].some(suffix => word.endsWith(suffix))) {
        return `${word}s`
    }
    if (word.endsWith("y")) {
        return `${word.slice(0, -1)}ies`
    }
    return `${word}s`
}
