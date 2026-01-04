import type { DeepPartial } from "../../../utils/types"

export interface Resource_Props<ResultType extends object = object> {
    $overrides?: DeepPartial<ResultType>
}
