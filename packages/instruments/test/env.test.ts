import { Env } from "@lib"

it("works", () => {
    const e = Env({
        a: 1
    })
        .overwrite({
            XYZ: "123",
            abc: "134"
        })
        .add("Z", "1")
    expect(e.toObject()).toMatchObject({
        a: "1",
        XYZ: "123",
        abc: "134",
        Z: "1"
    })

    expect(() => e.add("a", "2")).toThrow()
})
