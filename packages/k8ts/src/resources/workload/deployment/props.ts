import type { Resource_Props_Top } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import type { Pod_Props } from "../../.."

export interface Deployment_Strategy_RollingUpdate extends CDK.RollingUpdateDeployment {
    type: "RollingUpdate"
    options?: CDK.RollingUpdateDeployment
}
export interface Deployment_Strategy_Recreate {
    type: "Recreate"
}
export type Deployment_Strategy = Deployment_Strategy_RollingUpdate | Deployment_Strategy_Recreate

export interface Deployment_Props<Ports extends string>
    extends Resource_Props_Top<CDK.DeploymentSpec> {
    $replicas?: number
    $template: Pod_Props<Ports>
    $strategy?: Deployment_Strategy
}
