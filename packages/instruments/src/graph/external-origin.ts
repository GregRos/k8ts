import { Kind } from "../api-kind"
import { BaseOriginEntity } from "./base-origin-entity"
import { Origin } from "./origin-node"

export class ExternalOriginEntity extends BaseOriginEntity {
    constructor(parent: Origin, baseKind: Kind.Version) {
        super(
            "EXTERNAL",
            {
                meta: {
                    "^should not be manifested": (() => {}) as any
                }
            },
            K8tsRootOrigin
        )
    }
}
