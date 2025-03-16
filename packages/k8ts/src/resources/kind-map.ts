import { Origin, __impl } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata/."
import { k8tsBuildKind } from "../k8ts-sys-kind"

class K8tsRootOriginEntity implements __impl {
    kind = k8tsBuildKind.kind("Root")
    readonly node: Origin
    constructor() {
        this.node = new Origin(null, this)
    }
    get name() {
        return this.kind.name
    }
    get meta() {
        return Meta.make({
            "^produced-by": `k8ts@${k8tsBuildKind.name.slice(1)}`
        })
    }
}

export const K8tsRootOrigin = new K8tsRootOriginEntity()
export const K8tsResources = K8tsRootOrigin.node.resourceKinds
