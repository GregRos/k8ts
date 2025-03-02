export namespace Char {
    export namespace Prefix {
        export type Label = "%"
        export type Annotation = "^"
        export type Custom = `${Label | Annotation}`
    }

    export type Section = "/"
    export const Section = "/"

    export type Lower =
        `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"}`
    export type Upper = Uppercase<Lower>
    export type Digit = `${"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"}`
    export type Extra = "-" | "_" | "."
    export type Normal = `${Lower | Digit | Extra | Upper}`
}

export namespace Key {
    export type Nested = `${string}${Char.Normal}`

    export type Section = `${Char.Prefix.Custom}${string}${Char.Section}`
    export type Special = "name" | "namespace"
    export type Value = `${Char.Prefix.Custom}${Nested}` | Special

    export type Any = Section | Value
}

export namespace Dictx {
    type Of<T extends string, V> = Partial<Record<T, string>>
    export type Full = Of<Key.Value, string>
    export type Nested = Of<Key.Nested, string>
    export type Heading = Of<Key.Section, Nested>
    export type Input = Full & Heading
}
