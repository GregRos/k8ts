export class UnitValue<_Unit extends string = string> {
    constructor(
        readonly unit: _Unit,
        readonly value: number,
        readonly type: string
    ) {}

    get str() {
        return `${this.value}${this.unit}`
    }

    get val() {
        if (!this.unit) {
            return +this.value
        }
        return this.str
    }

    toString() {
        return this.str
    }
}
