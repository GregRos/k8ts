type _Alpha_Beta = "alpha" | "beta"
type _Sub_Version = `${_Alpha_Beta}${number}`
type Version = `v${number}${_Sub_Version | ""}`

export type _Group = string
export type _Slash<A extends string, B extends string> = `${A}/${B}`
export type _Group_Version<Group extends string = string, Vers extends string = string> =
    | _Slash<Group, Vers>
    | Version

type _Word_Plural_Map = {
    y: "ies"
    s: "es"
    ch: "ches"
    sh: "es"
    z: "zes"
    ro: "es"
    x: "es"
}

export type Pluralize<S extends string> = S extends `${infer K extends keyof _Word_Plural_Map}`
    ? `${K}${_Word_Plural_Map[K]}`
    : `${S}s`
export function pluralize<S extends string>(word: S): Pluralize<S> {
    if (["s", "sh", "ch", "x", "z", "ro"].some(suffix => word.endsWith(suffix))) {
        return `${word}es` as Pluralize<S>
    }
    if (word.endsWith("y")) {
        return `${word.slice(0, -1)}ies` as Pluralize<S>
    }
    return `${word}s` as Pluralize<S>
}
