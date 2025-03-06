import { PortSet } from "./set"
import type { InputPortSetRecord } from "./types"
export { PortMap } from "./map"
export { PortSet } from "./set"
export { InputPortMapping, InputPortSetRecord, PortMapEntry, PortSetEntry } from "./types"
export function ports<Names extends string>(input: InputPortSetRecord<Names>): PortSet<Names> {
    return PortSet.make(input)
}
