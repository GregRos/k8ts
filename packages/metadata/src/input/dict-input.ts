import { MetadataKey } from "../key"
import type { Key } from "../key/types"
import type { MetaLike } from "../meta"

export namespace MetaInputParts {
    type Of<T extends string, V> = {
        [K in T]?: V
    }
    type Full = Nested & Of<Key.Domain, Nested>
    export type Nested = Of<Key.Value, string>
    export type Heading = Of<Key.Domain, Nested>
    export type Input = Full & Heading
}

export type InputMeta =
    | MetaLike
    | MetaInputParts.Input
    | undefined
    | Iterable<readonly [MetadataKey, string]>
