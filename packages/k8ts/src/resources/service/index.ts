import * as Service from "./_index"
type Service<Port extends string> = Service.Service<Port>
export { Service }
