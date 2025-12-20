import { Kind } from "."

export type KindTreeRest = {
    [section: string]: KindTreeRest
}

type KindTreeGroups = {
    [group: string]: {
        [version: Kind.Version["__FORMAT__"]]: KindTreeRest
    }
}

type From_Subkinds<ParentSubKind extends Kind.IdentParent, R extends KindTreeRest> = {
    _: ParentSubKind
} & {
    [K in keyof R & string]: From_Subkinds<Kind.SubKind<K, ParentSubKind>, R[K]>
}

type _kind<
    sGroup extends string,
    sVersion extends string,
    sKind extends string,
    oKind extends KindTreeRest
> = {
    [sSubKind in keyof oKind & string]: From_Subkinds<
        Kind.SubKind<sSubKind, Kind.Kind<sGroup, sVersion, sKind>>,
        oKind[sSubKind]
    >
} & {
    _: Kind.Kind<sGroup, sVersion, sKind>
}

type _version<sGroup extends string, sVersion extends string, oVersion extends KindTreeRest> = {
    [sKind in keyof oVersion & string]: _kind<sGroup, sVersion, sKind, oVersion[sKind]>
} & {
    _: Kind.Version<sGroup, sVersion>
}

type _group<sGroup extends string, oGroup extends KindTreeRest> = {
    [sVersion in keyof oGroup & string]: _version<sGroup, sVersion, oGroup[sVersion]>
} & {
    _: Kind.Group<sGroup>
}

type From_Groups<oResourceTree extends KindTreeGroups> = {
    [sGroup in Exclude<keyof oResourceTree & string, "">]: _group<sGroup, oResourceTree[sGroup]>
} & (oResourceTree extends { "": any }
    ? {
          [V in keyof oResourceTree[""] & string]: _version<"", V, oResourceTree[""][V]>
      }
    : {})

function fromKindTree(parent: Kind.Identifier, kindTree: KindTreeRest): any {
    const result: any = {}
    for (const kindName in kindTree) {
        result[kindName] = fromKindTree(parent.child(kindName), kindTree[kindName])
    }
    result._ = parent
    return result
}

export function From_Groups<G extends KindTreeGroups>(groups: G): From_Groups<G> {
    let obj = {} as any
    for (const groupName in groups) {
        const x = Kind.group(groupName)
        obj = {
            ...obj,
            [groupName]: fromKindTree(x, groups[groupName])
        }
    }
    return obj
}
// flattens intersections/mapped types for nicer IntelliSense
export type Simplify<T> = { [K in keyof T]: T[K] } & {}

// same, but distributes over unions
export type SimplifyU<T> = T extends unknown ? Simplify<T> : never

// forces instantiation first (sometimes helps with inferred generics)
export type Resolve<T> = T extends infer O ? Simplify<O> : never

// deep version (keeps functions, preserves arrays/tuples)
export type SimplifyDeep<T> = T extends (...args: any[]) => any
    ? T
    : T extends readonly (infer U)[]
      ? readonly SimplifyDeep<U>[]
      : T extends { child: Function }
        ? T
        : T extends object
          ? Simplify<{ [K in keyof T]: SimplifyDeep<T[K]> }>
          : T

type HasCtor<T> = T extends { constructor: any } ? true : false

let x: HasCtor<{}> = null!
