import { mapValues } from "lodash"
import { BaseDecorator } from "./base"
import { Func } from "./type-utils/func"
import { Trait } from "./type-utils/trait"

export class TraitDecorator<
    In extends Trait.Def<keyof In>,
    Out extends Trait.Def<keyof Out>
> extends BaseDecorator<{
    __INPUT__: Trait.To<In>
    __OUTPUT__: Trait.To<Out>
    __SUBJECT__: In[keyof In]["__THIS__"]
}> {
    __TRAIT__!: In

    defaults<
        const X extends {
            [K in keyof In]?: Func.To<In[K]>
        }
    >(defaults: X): TraitDecorator<In | Omit<In, keyof X>, Out> {
        return new TraitDecorator(this.name, (self, input) => {
            return Object.assign({}, input, defaults) as any
        })
    }
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
            [K in keyof _T]: Func.Args.UnshiftThis<
                Func.Args.SetThis<_T[K], _T[keyof _T]["__THIS__"]>
            >
        },
        _T
    >(name, (self, input) => {
        return mapValues(input, f => f.bind(self, self))
    })
}
