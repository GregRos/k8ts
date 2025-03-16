import { NeedsEdge } from "@k8ts/instruments"
import type { AbsResource } from "./abs-resource"

export function dependencies(record: Record<string, AbsResource>) {
    return Object.entries(record).map(([key, value]) => {
        return new NeedsEdge(key, value.node)
    })
}
