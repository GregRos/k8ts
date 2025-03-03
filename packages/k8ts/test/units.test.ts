import {
    G,
    Gi,
    K,
    Ki,
    M,
    Mi,
    T,
    d,
    h,
    m,
    ms,
    parseCpuUnit,
    parseDataUnit,
    parseTimeUnit,
    s
} from "@lib/resources/units"
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
        expect(() => parseCpuUnit("1Ki").type).toThrow()
        expect(parseCpuUnit("1m").type).toBe("cpu")
    })
    it("parses data", () => {
        expect(parseDataUnit("1Ki").type).toBe("data")
        expect(() => parseDataUnit("1m").type).toThrow()
    })
    it("parses time", () => {
        expect(() => parseTimeUnit("1Ki").type).toThrow()
        expect(parseTimeUnit("1h").type).toBe("time")
    })
})
