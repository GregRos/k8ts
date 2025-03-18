import type { Key } from "../key/types"
import type { Meta, MutableMeta } from "../meta"

export namespace MetaInputParts {
    type Of<T extends string, V> = Partial<Record<T, V>>
    type Full = Nested & Of<Key.Section, Nested>
    export type Nested = Of<Key.Value, string>
    export type Heading = Of<Key.Section, Nested>
    export type Input = Full & Heading
}

export type InputMeta = MetaInputParts.Input | Meta | undefined | MutableMeta
