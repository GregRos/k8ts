import { Kind, MetadataEntity, Origin, OriginEntity, RefKey } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { k8tsBuildKind } from "./k8ts-sys-kind"

class K8tsRootOriginEntity implements OriginEntity {
    kind = k8tsBuildKind.kind("Root")
    readonly node: Origin
    get shortFqn() {
        return this.kind.name
    }
    constructor() {
        this.node = new Origin(null, this, RefKey.make(this.kind, "Root"))
    }

    get name() {
        return this.kind.name
    }
    get meta() {
        return Meta.make({
            "^produced-by": `k8ts@${k8tsBuildKind.name.slice(1)}`
        })
    }

    get decorator() {
        return <Target extends new (...args: any[]) => MetadataEntity>(kind: Kind.Identifier) => {
            return (ctor: Target) => {
                this.node.resourceKinds.add(kind, ctor)
                ctor.prototype.kind = kind
                return ctor
            }
        }
    }
}

export const K8tsRootOrigin = new K8tsRootOriginEntity()
export const K8tsResources = K8tsRootOrigin.node.resourceKinds

export const k8ts = K8tsRootOrigin.decorator
