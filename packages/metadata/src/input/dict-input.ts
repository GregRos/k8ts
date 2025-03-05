import type { Key } from "../key/types"
import type { Meta } from "../meta"

export namespace MetaInputParts {
    type Of<T extends string, V> = Partial<Record<T, V>>
    type Full = Of<Key.Value, string> & Of<Key.Section, Nested>
    export type Nested = Of<Key.Nested, string> & Of<Key.Value, never>
    export type Heading = Of<Key.Section, Nested>
    export type Input = Full & Heading
}

export type InputMeta = MetaInputParts.Input | Meta
