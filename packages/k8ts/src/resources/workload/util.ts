import type { K8sResource } from "@k8ts/instruments"
import { Metadata } from "@k8ts/metadata"

export function createSelectionMetadata(r: K8sResource) {
    return new Metadata({
        "%k8ts.org/owner": r["__entity_id__"]
    })
}
