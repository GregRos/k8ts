import type { Api } from "../api-kind"
import type { ReferenceKey } from "./key"

export type Kinded = { api: Api.Kind }
export type Refable<Object extends Kinded = Kinded, Name extends string = string> = Object & {
    key: ReferenceKey<Object["api"]["kind"], Name>
}
