import { DeploymentSpec as CDK_DeploymentSpec } from "@imports"
import type { Meta } from "@k8ts/metadata/."
import type { PodTemplate } from "../pod/template"

export type DeploymentProps = Omit<CDK_DeploymentSpec, "selector" | "template">

export class LK_Deployment<Ports extends string> {
    kind = "Deployment" as const
    constructor(
        readonly meta: Meta,
        readonly props: DeploymentProps,
        readonly pods: PodTemplate<Ports>
    ) {}

    get name() {
        return this.meta.get("name")
    }
}
