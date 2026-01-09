import type { TopResource } from "@k8ts/instruments"
import { Metadata } from "@k8ts/metadata"

export function createSelectionMetadata(r: TopResource) {
    return new Metadata({
        "%k8ts.org/owner": r["__entity_id__"]
    })
}
