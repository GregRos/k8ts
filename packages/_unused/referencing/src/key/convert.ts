import type { Map } from "immutable"
import type { ValueKey } from "./repr"

export function toObjectForm(map: Map<ValueKey, string>) {
    return map.mapKeys(x => x.str).toObject()
}
