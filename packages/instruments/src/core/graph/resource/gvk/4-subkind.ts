import { Gvk_Base } from "./0-base"
import { Gvk } from "./3-gvk"

export class Gvk_SubKind<Url extends string = string> extends Gvk_Base<Url> {
    get parent() {
        const [group, version, kind] = this.url.split("/")
        return new Gvk<`${string}/${string}`>(
            `${group}/${version}/${kind}` as `${string}/${string}`
        )
    }

    get value(): Url extends `${string}.${infer Sk}` ? Sk : never {
        return this.url.split("/").at(-1) as any
    }

    subkind<SubKind extends string>(subKind: SubKind) {
        return new Gvk_SubKind<`${Url}.${SubKind}`>(`${this.url}.${subKind}` as `${Url}.${SubKind}`)
    }
}
