import { AccessMode } from "./access-mode"
import { DataMode } from "./block-mode"
import { Claim } from "./claim"
import { Volume } from "./volume"
export type Volume<T extends DataMode = DataMode> = Volume.Volume<T>
export type Claim<T extends DataMode = DataMode> = Claim.Claim<T>
export { AccessMode, Claim, DataMode, Volume }
