import type { PortExportsInput } from "./set"
import { PortExports } from "./set"
export { PortMap, type PortMapping_Input } from "./map"
export { PortExports, type PortExportsInput } from "./set"
export type { PortFull, PortMappingEntry } from "./types"
export function ports<Names extends string>(input: PortExportsInput<Names>): PortExports<Names> {
    return PortExports.make(input)
}
