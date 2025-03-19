import { ResourcesSpec, Unit } from "@lib"

const reqLimitCpuSpec = ResourcesSpec.make({
    cpu: Unit.Cpu
})
it("valid inputs - CPU", () => {
    const reqLimit = reqLimitCpuSpec.parse({
        cpu: "1m--->2m"
    })
    expect(reqLimit.toObject()).toMatchObject({
        requests: {
            cpu: "1m"
        },
        limits: {
            cpu: "2m"
        }
    })
})

it("invalid inputs - CPU", () => {
    expect(() =>
        reqLimitCpuSpec.parse({
            // @ts-expect-error
            cpu: "1m--->2"
        })
    ).toThrow()
    expect(() =>
        reqLimitCpuSpec.parse({
            // @ts-expect-error
            cpu: "1m"
        })
    ).toThrow()
    expect(() =>
        reqLimitCpuSpec.parse({
            // @ts-expect-error
            cpu: "1m--->2m--->3m"
        })
    ).toThrow()
})

const reqLimitMemoryCpuSpec = ResourcesSpec.make({
    cpu: Unit.Cpu,
    memory: Unit.Data
})
it("valid inputs - Data, Cpu", () => {
    const reqLimit = reqLimitMemoryCpuSpec.parse({
        cpu: "1m--->2m",
        memory: "1Mi--->2Gi"
    })
    expect(reqLimit.toObject()).toMatchObject({
        requests: {
            cpu: "1m",
            memory: "1Mi"
        },
        limits: {
            cpu: "2m",
            memory: "2Gi"
        }
    })
})

it("invalid inputs - Data", () => {
    expect(() =>
        reqLimitMemoryCpuSpec.parse({
            cpu: "1m--->2m",
            // @ts-expect-error
            memory: "1Mi--->2"
        })
    ).toThrow()
    expect(() =>
        reqLimitMemoryCpuSpec.parse({
            cpu: "1m--->2m",
            // @ts-expect-error
            memory: "1Mi"
        })
    ).toThrow()
    expect(() =>
        // @ts-expect-error
        reqLimitMemoryCpuSpec.parse({
            memory: "1Mi--->2Gi"
        })
    ).toThrow()
})
