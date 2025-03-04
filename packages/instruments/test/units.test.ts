import { G, Gi, K, Ki, M, Mi, T, Unit, d, h, m, ms, s } from "@lib"
it("creates different units and stuff", () => {
    expect(Ki(1)).toBe("1Ki")
    expect(G(1)).toBe("1G")
    expect(M(1)).toBe("1M")
    expect(K(1)).toBe("1K")
    expect(T(1)).toBe("1T")
    expect(Gi(1)).toBe("1Gi")
    expect(Mi(1)).toBe("1Mi")
    expect(m(1)).toBe("1m")
    expect(h(1)).toBe("1h")
    expect(d(1)).toBe("24h")
    expect(s(1)).toBe("1s")
    expect(ms(1)).toBe("1ms")
})

describe("parses specific types", () => {
    it("parses cpu", () => {
        expect(() => Unit.parseCpu("1Ki").type).toThrow()
        expect(Unit.parseCpu("1m").type).toBe("cpu")
    })
    it("parses data", () => {
        expect(Unit.parseData("1Ki").type).toBe("data")
        expect(() => Unit.parseData("1m").type).toThrow()
    })
    it("parses time", () => {
        expect(() => Unit.parseTime("1Ki").type).toThrow()
        expect(Unit.parseTime("1h").type).toBe("time")
    })
})
