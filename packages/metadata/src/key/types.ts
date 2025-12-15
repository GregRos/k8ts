export namespace Char {
    export namespace Prefix {
        export type Label = "%"
        export type Annotation = "^"
        export type Comment = "#"
        export type Custom = `${Label | Annotation | Comment}`
    }

    export type Section = "/"
    export const Section = "/"
}

export namespace Key {
    export type Section = `${string}${Char.Section}`
    export type Special = "name" | "namespace"
    export type Value = (`${Char.Prefix.Custom}${string}` & `${string}${string}`) | Special

    export type Key = Section | Value
}
export type Key = Key.Key
