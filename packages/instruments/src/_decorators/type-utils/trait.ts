import { Func } from "./func"

export namespace Trait {
    export type CheckDef<T extends Def<keyof T>> = T
    export type Def<K extends PropertyKey> = {
        [k in K]: Func.Def
    }
    export type Shape<K extends PropertyKey, Subject extends object = any> = {
        [k in K]: (this: Subject, ...args: any[]) => any
    }

    export type From<T> = {
        [K in keyof T]: Func.From<T[K]>
    }

    export type StripUndefined<T> = {
        [K in keyof T as T[K] extends undefined ? never : K]: T[K]
    }

    type A = StripUndefined<{ a: undefined; b: string }>

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
    export type Mapping<
        Subject extends object,
        T extends Def<keyof T>,
        T2 extends Def<keyof T2>
    > = {
        [K in keyof T]: K extends keyof T2 ? Func.Mapping<Subject, T[K], T2[K]> : never
    }
}
