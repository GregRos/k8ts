import type { PortExportsInput } from "./set"
import { PortsExposed } from "./set"
export { PortsMapped, type PortMapping_Input } from "./map"
export { PortsExposed, type PortExportsInput } from "./set"
export type { PortFull, PortMappingEntry } from "./types"
export function ports<Names extends string>(input: PortExportsInput<Names>): PortsExposed<Names> {
    return PortsExposed.make(input)
}
