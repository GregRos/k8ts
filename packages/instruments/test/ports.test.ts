import { ports } from "@lib"

it("should do ports", () => {
    const ps = ports({
        http: 80,
        https: 443,
        extra: "8080/udp",
        also: "8081"
    })

    expect(ps.get("extra").protocol).toBe("UDP")
    expect(ps.get("also").port).toBe(8081)
    expect(ps.pick("http", "https").values.size).toBe(2)
    const picked = ps.pick("http", "https")
    // @ts-expect-error
    expect(() => picked.get("extra")).toThrow()
})

it("should do mapping", () => {
    const ps2 = ports({
        http: 80,
        https: 443,
        extra: "8080/udp",
        also: "8081/TCP"
    })

    expect(() =>
        // @ts-expect-error
        ps2.map({
            also: 1
        })
    ).toThrow()

    const ok = ps2.map({
        http: 8080,
        https: 8443,
        extra: 8081,
        also: 8082
    })

    expect(ok.get("http")).toEqual({
        name: "http",
        protocol: "TCP",
        source: 80,
        target: 8080
    })
})
