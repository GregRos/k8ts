import type { Api } from "../api-kind"
import type { ReferenceKey } from "./key"

export type Kinded = { api: Api.Kind }
export type Refable<Kind extends string, Name extends string> = {
    key: ReferenceKey<Kind, Name>
}
export type LiveRefable<Object extends Kinded = Kinded, Name extends string = string> = Object &
    Refable<Object["api"]["kind"], Name>
