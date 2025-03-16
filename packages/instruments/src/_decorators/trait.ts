import { mapValues } from "lodash"
import { BaseDecorator } from "./base"
import { Func } from "./type-utils/func"
import { Trait } from "./type-utils/trait"

export class TraitDecorator<
    In extends Trait.Def<keyof In>,
    Out extends Trait.Def<keyof In>
> extends BaseDecorator<{
    __INPUT__: Trait.To<In>
    __OUTPUT__: Trait.To<Out>
    __SUBJECT__: In[keyof In]["__THIS__"]
}> {
    __TRAIT__!: In
}

export function $For<Subject extends object>() {
    return {
        Trait<T extends Trait.Shape<keyof T, Subject>>(name: string) {
            type _T = Trait.From<T>

            return new TraitDecorator<
                {
                    [K in keyof T]: Func.Args.UnshiftThis<Func.Args.SetThis<_T[K], Subject>>
                },
                _T
            >(name, (self, input) => {
                return mapValues(input, f => f.bind(self, self))
            })
        }
    }
}
export function Trait<T extends Trait.Shape<keyof T>>(name: string) {
    type _T = Trait.From<T>

    return new TraitDecorator<
        {
            [K in keyof T]: Func.Args.UnshiftThis<Func.Args.SetThis<_T[K], _T[keyof T]["__THIS__"]>>
        },
        _T
    >(name, (self, input) => {
        return mapValues(input, f => f.bind(self, self))
    })
}

export interface TraitExample {
    a: (a: number) => number
    b: (b: string) => string
}

interface BABA {
    zzzz: string
}

const tt = $For<BABA>().Trait<TraitExample>("test")
tt.set(null! as BABA, {
    a: x => x.zzzz.length,
    b: x => x.zzzz
})
