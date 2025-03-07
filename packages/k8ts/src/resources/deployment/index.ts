import * as Deployment from "./deployment"
type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export { Deployment }
