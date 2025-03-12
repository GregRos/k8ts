import { Meta } from "@k8ts/metadata"

export function k8tsSectionMeta(meta: Meta.Input) {
    const m = Meta.make(meta)
    return m.section("k8ts.org")
}
