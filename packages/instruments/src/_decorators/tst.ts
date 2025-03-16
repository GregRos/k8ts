import { $For } from "./trait"

export interface Trait {
    a(x: string): void
    b(x: string): void
}

export interface Target {
    zzzz: 1
}

export const Example = $For<Target>().Trait<Trait>("Example")
;() => {
    Example.set(null!, {
        a: x => x.zzzz,
        b: x => x.zzzz
    })

    Example.defaults({
        a: x => x.zzzz
    })
        .set(null!, {
            b: x => x.zzzz
        })
        .set(
            null!, // @ts-expect-error
            {
                a: x => x.zzzz
            }
        )
        .set(null!, {
            a: x => x.zzzz,
            b: x => x.zzzz
        })
        .map({
            a: (self, f) => (a: string) => 1,
            b: (self, f) => () => 5
        })
        .getOn(null!)
        .a()
}
