export interface GVK_Like {
    readonly value: string
    readonly url: string
    readonly dns: string
    readonly parent: GVK_Like | null
    equals(other: any): boolean
}
export abstract class GVK_Base<Url extends string = string> implements GVK_Like {
    constructor(readonly url: Url) {}
    abstract get value(): string
    abstract get parent(): GVK_Base | null
    get parts(): GVK_Base[] {
        const parts: GVK_Base[] = []
        let curr: GVK_Base | null = this
        while (curr) {
            parts.unshift(curr)
            curr = curr.parent
        }
        return parts
    }
    get dns() {
        return this.parts
            .map(p => p.value)
            .filter(Boolean)
            .join(".")
    }

    equals(other: any) {
        if (other instanceof GVK_Base) {
            return this.url === other.url
        }
        if (typeof other === "string") {
            return this.url === other
        }
        return false
    }
}
