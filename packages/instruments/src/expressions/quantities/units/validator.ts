import { K8tsQuantityError } from "../error"
import type { Dimension_Props } from "./dimension"

export type Dimension_Validator<Units extends string> = (unit: string) => asserts unit is Units
export function getValidator<Units extends string>(
    props: Dimension_Props<Units>
): Dimension_Validator<Units> {
    if (props.units === "any") {
        return (_unit: string) => true
    }
    const validUnits = new Set(props.units)
    return (unit: string) => {
        if (!validUnits.has(unit as any)) {
            throw new K8tsQuantityError(`Unit ${unit} is not a valid unit of type ${props.name}`)
        }
    }
}
