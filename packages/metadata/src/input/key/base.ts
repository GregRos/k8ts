export abstract class BaseKey {
    abstract get str(): string
    equals(other: any): boolean {
        return this.constructor === other.constructor && this.toString() === other.toString()
    }

    toString() {
        return this.str
    }
}
