import type { Metadata_Key_Domain, Metadata_Key_OfValue } from "./key/string-types"

export namespace MetaInputParts {
    type Of<T extends string, V> = {
        [K in T]?: V
    }
    type Full = Nested & Of<Metadata_Key_Domain, Nested>
    export type Nested = Of<Metadata_Key_OfValue, string>
    export type Input = Full
}

export type Metadata_Input = MetaInputParts.Input | undefined | Iterable<readonly [string, string]>
