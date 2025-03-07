export * from "./service"
import * as Port from "./service-port"
type Port<Port extends string> = Port.Port<Port>

export { Port }
