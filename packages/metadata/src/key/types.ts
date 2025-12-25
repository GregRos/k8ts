export namespace Char {
    export namespace Prefix {
        export type Label = "%"
        export type Annotation = "^"
        export type Comment = "#"
        export type Any = `${Label | Annotation | Comment}`
    }
    export namespace Suffix {
        export type Domain = "/"
        export const Domain = "/"
    }
}

export namespace Key {
    export type Domain = `${string}${Char.Suffix.Domain}`
    export type Special = "name" | "namespace"
    export type Value = (`${Char.Prefix.Any}${string}` & `${string}${string}`) | Special

    export type Key = Domain | Value
}
export type Key = Key.Key
