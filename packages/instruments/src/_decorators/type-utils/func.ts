export namespace Func {
    export interface Def {
        __THIS__: object
        __ARGS__: any[]
        __RETURN__: any
    }
    export type From<T> = T extends (this: infer This, ...args: infer Args) => infer Result
        ? {
              __THIS__: This
              __ARGS__: Args
              __RETURN__: Result
          }
        : never

    export type To<X extends Def> = (this: X["__THIS__"], ...args: X["__ARGS__"]) => X["__RETURN__"]
    export namespace Args {
        export type Unshift<T extends Def, Arg> = Omit<T, "__ARGS__"> & {
            __ARGS__: [Arg, ...T["__ARGS__"]]
        }

        export type SetThis<T extends Def, This> = Omit<T, "__THIS__"> & {
            __THIS__: This
        }

        export type UnshiftThis<T extends Def> = Omit<T, "__ARGS__"> & {
            __ARGS__: [T["__THIS__"], ...T["__ARGS__"]]
        }
    }
    export namespace Return {
        export type Set<T extends Def, Return> = Omit<T, "__RETURN__"> & {
            __RETURN__: Return
        }
    }
    export type Mapping<Subject extends object, T extends Def, T2 extends Def> = (
        this: Subject,
        self: Subject,
        f: To<T>
    ) => To<T2>
}
