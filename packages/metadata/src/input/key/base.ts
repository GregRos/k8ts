export abstract class Metadata_Key_Base {
    abstract get str(): string
    equals(other: any): boolean {
        return this.constructor === other.constructor && this.toString() === other.toString()
    }

    toString() {
        return this.str
    }
}
