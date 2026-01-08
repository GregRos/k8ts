import { Metadata } from "@k8ts/metadata"

export function createSelectionMetadata(name: string) {
    return new Metadata({
        "%k8ts.org/app": name
    })
}
