import type { Port_Exports_Input } from "./set"
import { Port_Exports } from "./set"
export { Port_Map, type PortMapping_Input } from "./map"
export { Port_Exports, type Port_Exports_Input } from "./set"
export type { Port_Full, Port_Mapping_Entry } from "./types"
export function ports<Names extends string>(input: Port_Exports_Input<Names>): Port_Exports<Names> {
    return Port_Exports.make(input)
}
