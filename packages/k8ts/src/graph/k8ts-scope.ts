import { TypedScope } from "@k8ts/instruments"
import type { Base } from "../node/base"
import { K8tsResources } from "../resources/kind-map"

export class K8tsScope extends TypedScope<Base> {
    override get registered() {
        return K8tsResources
    }
}
