import type { JoinIfNotEmpty } from "../../../../expressions"
import { Gvk_Base } from "./0-base"
import { Gvk_Version } from "./2=version"
import type { GVK_sVersion } from "./strings"
export class Gvk_Group<Group extends string = string> extends Gvk_Base<Group> {
    get parts() {
        return [this]
    }
    get parent() {
        return null
    }
    get value(): Group {
        return this.url
    }

    version<Version extends GVK_sVersion>(version: Version) {
        const newUrl = [this.url, version].filter(Boolean).join("/")
        return new Gvk_Version(newUrl as JoinIfNotEmpty<Group, "/", Version>)
    }
}
export function group<ApiGroup extends string>(apiGroup: ApiGroup) {
    return new Gvk_Group(apiGroup)
}
