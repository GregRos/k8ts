import type { AbsResource } from "./abs-resource"

export function dependencies(record: Record<string, AbsResource>) {
    return Object.entries(record).map(([text, resource]) => ({ resource, text }))
}
