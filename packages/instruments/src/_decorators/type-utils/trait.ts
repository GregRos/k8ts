import { Func } from "./func"

export namespace Trait {
    export type CheckDef<T extends Def<keyof T>> = T
    export type Def<Keys extends PropertyKey, FuncType extends Func.Def = Func.Def> = {
        [K in Keys]: FuncType
    }
    export type Shape<T extends PropertyKey, Subject extends object = any> = Partial<
        Record<T, (this: Subject, ...args: any[]) => any>
    >

    export type From<T> = {
        [K in keyof T]: Func.From<T[K]>
    }

    export type To<X extends Def<keyof X>> = {
        [K in keyof X]: Func.To<X[K]>
    }

    export namespace Args {
        export type GetThis<T extends Def<keyof T>> = T[keyof T]["__THIS__"]
        export type Unshift<T extends Def<keyof T>, Arg> = {
            [K in keyof T]: Func.Args.Unshift<T[K], Arg>
        }
        export type UnshiftThis<T extends Def<keyof T>> = {
            [K in keyof T]: Func.Args.UnshiftThis<T[K]>
        }

        export type SetThis<T extends Def<keyof T>, This> = {
            [K in keyof T]: Func.Args.SetThis<T[K], This>
        }
    }
    export type Mapping<T extends Def<keyof T>, T2 extends Def<keyof T>> = {
        [K in keyof T]: Func.Mapping<T[K], T2[K]>
    }
}
