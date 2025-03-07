import { Access as Access_ } from "./access-mode"
import { DataMode as DataMode_ } from "./block-mode"
import { Claim as Claim_ } from "./claim"
import { Volume as Volume_ } from "./volume"
export namespace Persistent {
    export import Claim = Claim_
    export import Volume = Volume_
    export import Access = Access_
    export type DataMode = DataMode_
}
