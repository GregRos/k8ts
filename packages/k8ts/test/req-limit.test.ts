import { parseCpuReqLimit, parseDataReqLimit } from "@lib/resources/req-limit/parser"

it("valid inputs - CPU", () => {
    const reqLimit = parseCpuReqLimit("1m--->2m")
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
    expect(() => parseCpuReqLimit("1m--->2Mi")).toThrow()
    expect(() => parseCpuReqLimit("1m--->2")).toThrow()
    expect(() => parseCpuReqLimit("1m")).toThrow()
    expect(() => parseCpuReqLimit("1m--->2m--->3m")).toThrow()
})

it("valid inputs - Data", () => {
    const reqLimit = parseDataReqLimit("1Mi--->2Gi")
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
    expect(() => parseDataReqLimit("1Mi--->2m")).toThrow()
    expect(() => parseDataReqLimit("1Mi--->2")).toThrow()
    expect(() => parseDataReqLimit("1Mi")).toThrow()
    expect(() => parseDataReqLimit("1Mi--->2Mi--->3Mi")).toThrow()
})
