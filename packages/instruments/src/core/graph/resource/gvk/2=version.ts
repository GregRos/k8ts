import { Gvk_Base } from "./0-base"
import { group, Gvk_Group } from "./1-group"
import { Gvk } from "./3-gvk"
import type { GVK_sVersion } from "./strings"

export class Gvk_Version<Url extends string> extends Gvk_Base<Url> {
    get parent() {
        return new Gvk_Group(this.url.split("/")[0] as string)
    }

    get value(): Url extends `${string}/${infer V}` ? V : Url extends `v${string}` ? Url : never {
        return this.url.split("/")[1] as any
    }

    kind<Kind extends string>(kind: Kind, customPlural?: string) {
        return new Gvk(`${this.url}/${kind}` as `${Url}/${Kind}`, customPlural)
    }
}
export function version<ApiVersion extends GVK_sVersion>(apiVersion: ApiVersion) {
    return group("").version(apiVersion)
}
