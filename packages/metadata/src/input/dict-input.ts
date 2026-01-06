import type { Metadata_Key_sDomain, Metadata_Key_sValue } from "./key/string-types"

export namespace MetaInputParts {
    type Of<T extends string, V> = {
        [K in T]?: V
    }
    type Full = Nested & Of<Metadata_Key_sDomain, Nested>
    export type Nested = Of<Metadata_Key_sValue, string>
    export type Input = Full
}

export type Metadata_Input = MetaInputParts.Input | undefined | Iterable<readonly [string, string]>
