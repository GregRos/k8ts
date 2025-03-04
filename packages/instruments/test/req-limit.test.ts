import { ReqLimit } from "@lib"

it("valid inputs - CPU", () => {
    const reqLimit = ReqLimit.Cpu.parse("1m--->2m")
    expect(reqLimit).toMatchObject({
        request: {
            value: 1,
            unit: "m"
        },
        limit: {
            value: 2,
            unit: "m"
        }
    })
})

it("invalid inputs - CPU", () => {
    expect(() => ReqLimit.Cpu.parse("1m--->2Mi")).toThrow()
    expect(() => ReqLimit.Cpu.parse("1m--->2")).toThrow()
    expect(() => ReqLimit.Cpu.parse("1m")).toThrow()
    expect(() => ReqLimit.Cpu.parse("1m--->2m--->3m")).toThrow()
})

it("valid inputs - Data", () => {
    const reqLimit = ReqLimit.Data.parse("1Mi--->2Gi")
    expect(reqLimit).toMatchObject({
        request: {
            value: 1,
            unit: "Mi"
        },
        limit: {
            value: 2,
            unit: "Gi"
        }
    })
})

it("invalid inputs - Data", () => {
    expect(() => ReqLimit.Data.parse("1Mi--->2m")).toThrow()
    expect(() => ReqLimit.Data.parse("1Mi--->2")).toThrow()
    expect(() => ReqLimit.Data.parse("1Mi")).toThrow()
    expect(() => ReqLimit.Data.parse("1Mi--->2Mi--->3Mi")).toThrow()
})
