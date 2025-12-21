const digits = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"]

export function toSuperScript(n: number): string {
    if (n < 0) {
        return "⁻" + toSuperScript(-n)
    }
    const num = []
    while (n >= 0) {
        const digit = n % 10
        n = Math.floor(n / 10)
        num.unshift(digits[digit])
        if (n === 0) {
            break
        }
    }
    return num.join("")
}
