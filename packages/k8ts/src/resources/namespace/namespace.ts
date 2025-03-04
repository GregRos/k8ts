import type { CDK } from "@imports"
import { Base } from "../../graph/base"

export interface NamespaceProps {}
export class Namespace extends Base<NamespaceProps> {
    override kind = "Namespace" as const

    override manifest(): CDK.KubeNamespaceProps {
        return {
            metadata: this.meta.expand(),
            spec: {}
        }
    }

    emit()
}
