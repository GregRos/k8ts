import { Meta } from "@lib"

it("accepts all valid value keys", () => {
    const m = Meta.make({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye",
        name: "x",
        namespace: "y"
    })
    expect(m.get("%label")).toBe("Hello")
    expect(m.get("%label2")).toBe("World")
    expect(m.get("^annotation")).toBe("goodbye")
    expect(m.get("name")).toBe("x")
    expect(m.get("namespace")).toBe("y")
})

it("accepts mix of value and section keys", () => {
    const m = Meta.make({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye",
        name: "x",
        namespace: "y",
        "^label/": {
            a: "A"
        }
    })
    expect(m.get("%label")).toBe("Hello")
    expect(m.get("%label2")).toBe("World")
    expect(m.get("^annotation")).toBe("goodbye")
    expect(m.get("name")).toBe("x")
    expect(m.get("namespace")).toBe("y")
    expect(m.get("^label/a")).toBe("A")

    // @ts-expect-error
    expect(() => m.get("%x/")).toThrow()
})

describe("fails for different types of invalid keys", () => {
    it("invalid prefix", () => {
        expect(() =>
            Meta.make({
                // @ts-expect-error
                "@label": "Hello"
            })
        ).toThrow()
        expect(() =>
            Meta.make({
                // @ts-expect-error
                "(label": "Hello"
            })
        ).toThrow()
        expect(() =>
            Meta.make({
                // @ts-expect-error
                label: "Hello"
            })
        ).toThrow()
    })

    it("no prefix for non-special key", () => {
        expect(() =>
            Meta.make({
                // @ts-expect-error
                label: "Hello"
            })
        ).toThrow()

        expect(() =>
            Meta.make({
                // @ts-expect-error
                "label/": "Hello"
            })
        ).toThrow()
    })
})
it("section keys when appropriate", () => {
    expect(
        Meta.make({
            "%f/": {
                x: "A"
            }
        }).get("%f/x")
    ).toBe("A")
    expect(
        Meta.make({
            "^label/": {
                a: "A"
            }
        }).get("^label/a")
    ).toBe("A")
    expect(() =>
        Meta.make({
            // @ts-expect-error
            "label/": {
                a: "A"
            }
        })
    ).toThrow()
    expect(() =>
        Meta.make({
            // @ts-expect-error
            "%label/": "hello"
        })
    ).toThrow()
})
