import type { ReferenceKey } from "./key"

export type Kinded = { kind: string }
export type Refable<Object extends Kinded = Kinded, Name extends string = string> = Object & {
    key: ReferenceKey<Object["kind"], Name>
}
