import {
    BaseOriginEntity,
    Kind,
    kinded,
    MetadataEntity,
    OriginEntityProps
} from "@k8ts/instruments"
import { k8tsBuildKind } from "./k8ts-sys-kind"
const ident = k8tsBuildKind.kind("World")

@kinded(ident)
class K8tsRootOriginEntity extends BaseOriginEntity<OriginEntityProps> {
    override kind = ident
    constructor() {
        super(
            "K8ts",
            {
                meta: {
                    "^produced-by": `k8ts@${k8tsBuildKind.name.slice(1)}`
                }
            },
            null
        )
    }

    get decorator() {
        return <Target extends new (...args: any[]) => MetadataEntity>(kind: Kind.Identifier) => {
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
