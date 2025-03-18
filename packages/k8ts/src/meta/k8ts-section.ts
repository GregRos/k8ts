import { Meta } from "@k8ts/metadata"
import { k8ts_namespace } from "../runner/exporter/meta"
export function k8tsSectionMeta(meta: Meta.Input) {
    const m = Meta.make(meta)
    return m.section(k8ts_namespace)
}
