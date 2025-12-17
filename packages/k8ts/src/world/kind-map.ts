import {
    BaseOriginEntity,
    Kind,
    kinded,
    OriginEntityProps,
    ResourceEntity
} from "@k8ts/instruments"
import { build } from "./k8ts-sys-kind"

class K8tsRootOriginEntity extends BaseOriginEntity<OriginEntityProps> {
    override kind = build.current.World._
    constructor() {
        super(
            "K8ts",
            {
                meta: {
                    "^produced-by": `k8ts@${build.current._.name.slice(1)}`
                }
            },
            null
        )
    }

    get decorator() {
        return <Target extends abstract new (...args: any[]) => ResourceEntity>(
            kind: Kind.Identifier
        ) => {
            return (ctor: Target) => {
                this.node.resourceKinds.add(kind, ctor)
                kinded(kind)(ctor)
                return ctor
            }
        }
    }
}

export const K8tsRootOrigin = new K8tsRootOriginEntity()
export const K8tsResources = K8tsRootOrigin.node.resourceKinds

export const k8ts = K8tsRootOrigin.decorator
export const REF_TYPE = Symbol.for("k8ts:ref")
