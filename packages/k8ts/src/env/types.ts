import type { Ref2_Of, Resource_Ref_Keys_Of } from "@k8ts/instruments"
import type { ConfigMap } from "../resources"

export type Env_Value = string | null | number | boolean | bigint | undefined
export interface Env_From<Backend extends Ref2_Of = Ref2_Of> {
    $backend: Backend
    key: Resource_Ref_Keys_Of<this["$backend"], string>
    optional?: boolean
}

export type InputEnvValue = string | null | number | boolean | bigint | undefined | EnvVarFrom
export type InputEnvMapping = Partial<Record<string, InputEnvValue>>
export interface EnvVarFrom<_Backend extends Ref2_Of = Ref2_Of> {
    $backend: _Backend
    key: Resource_Ref_Keys_Of<this["$backend"], string>
    optional?: boolean
}
function test<
    T extends {
        [key in keyof T]: {
            $backend: Ref2_Of & { keys: string[] }
            key: T[key]["$backend"]["keys"][number]
        }
    }
>(obj: T): void {}
export interface TTT<Backend extends Ref2_Of = Ref2_Of> {
    $backend: Backend
    key: Resource_Ref_Keys_Of<this["$backend"], string>
}
interface A<X> {
    x: X
}
function test2<T extends A<Record<keyof T, TTT | number>>>(obj: T): void {}
test({
    a: {
        $backend: null! as ConfigMap<"", "abc">,
        key: "abc"
    }
})
