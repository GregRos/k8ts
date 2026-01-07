import { GVK_Base } from "./0-base"
import { GVK } from "./3-gvk"

export class GVK_SubKind<Url extends string = string> extends GVK_Base<Url> {
    get parent() {
        const [group, version, kind] = this.url.split("/")
        return new GVK<`${string}/${string}`>(
            `${group}/${version}/${kind}` as `${string}/${string}`
        )
    }

    get value(): Url extends `${string}.${infer Sk}` ? Sk : never {
        return this.url.split("/").at(-1) as any
    }

    subkind<SubKind extends string>(subKind: SubKind) {
        return new GVK_SubKind<`${Url}.${SubKind}`>(`${this.url}.${subKind}` as `${Url}.${SubKind}`)
    }
}
