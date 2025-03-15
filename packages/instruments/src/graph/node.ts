import { Meta, MutableMeta } from "@k8ts/metadata/."
import { Kind } from "../api-kind"
import { RefKey } from "../ref-key"

const CAN_BE_NEEDED = Symbol.for("k8ts/node/can-be-needed")
const CAN_BE_CHILD = Symbol.for("k8ts/node/can-be-child")
const CAN_BE_PARENT = Symbol.for("k8ts/node/can-be-parent")
const RESOURCE_ENTITY = Symbol.for("k8ts/entity/resource")
const ORIGIN_ENTITY = Symbol.for("k8ts/entity/origin")
const ORIGIN_NODE = Symbol.for("k8ts/node/origin")
const RESOURCE_NODE = Symbol.for("k8ts/node/resource")
export type Formats = "short" | "fqn" | "shortFqn"
export interface R_Entity {
    [RESOURCE_ENTITY]: true
    readonly name: string
    readonly node: R_Node<this>
}
export abstract class R_Node<Entity extends R_Entity = R_Entity> {
    [RESOURCE_NODE] = true
    get name() {
        return this._entity.name
    }

    get needs(): Mixin_CanBeNeeded[] {
        return []
    }
    abstract readonly key: RefKey
    abstract readonly kind: Kind.Identifier
    format(format: Formats) {
        switch (format) {
            case "short":
                return this.name
            case "fqn":
                return this.key.string
            case "shortFqn":
                return this.key.name
        }
    }
    constructor(private readonly _entity: Entity) {}
}

export interface R_Manifest extends R_Entity {
    readonly meta: MutableMeta | Meta
}

export interface Mixin_CanBeChild<ParentType> {
    [CAN_BE_CHILD]: true
    readonly parent: ParentType
    readonly ancestors: ParentType[]

    readonly root: ParentType
}

export interface Mixin_CanBeParent<ChildType> {
    [CAN_BE_PARENT]: true
    readonly kids: Iterable<ChildType>

    readonly descendants: Iterable<ChildType>
}

export interface Mixin_CanBeNeeded {
    [CAN_BE_NEEDED]: true
}

export interface O_Entity {
    [ORIGIN_ENTITY]: true
    readonly name: string
    readonly node: O_Node<this>
}
export abstract class O_Node<O extends O_Entity = O_Entity> {
    [ORIGIN_NODE] = true
    get parent() {
        return this.ancestors[0]
    }

    get root() {
        return this.ancestors.at(-1)
    }

    get name() {
        return this._entity.name
    }
    abstract get ancestors(): Array<O_Node & Mixin_CanBeParent<O_Node>>
    constructor(private readonly _entity: O) {}
}
