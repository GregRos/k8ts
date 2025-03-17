import { NeedsEdge, ResourceEntity } from "./node"

export namespace Dependencies {
    export type Input = Record<string, ResourceEntity>
}
export function dependencies(record: Dependencies.Input) {
    return Object.entries(record).map(([key, value]) => {
        return new NeedsEdge(key, value.node)
    })
}
