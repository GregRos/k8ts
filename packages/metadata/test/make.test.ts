import { meta, Meta } from "@lib"

it("accepts all valid value keys", () => {
    const m = Meta.from({
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
    const m = Meta.from({
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
            meta({
                // @ts-expect-error
                "@label": "Hello"
            })
        ).toThrow()
        expect(() =>
            meta({
                // @ts-expect-error
                "#label": "Hello"
            })
        ).toThrow()
        expect(() =>
            meta({
                // @ts-expect-error
                label: "Hello"
            })
        ).toThrow()
    })

    it("no prefix for non-special key", () => {
        expect(() =>
            meta({
                // @ts-expect-error
                label: "Hello"
            })
        ).toThrow()

        expect(() =>
            meta({
                // @ts-expect-error
                "label/": "Hello"
            })
        ).toThrow()
    })
})
it("section keys when appropriate", () => {
    expect(
        meta({
            "%f/": {
                x: "A"
            }
        }).get("%f/x")
    ).toBe("A")
    expect(
        meta({
            "^label/": {
                a: "A"
            }
        }).get("^label/a")
    ).toBe("A")
    expect(() =>
        meta({
            // @ts-expect-error
            "label/": {
                a: "A"
            }
        })
    ).toThrow()
    expect(() =>
        meta({
            // @ts-expect-error
            "%label/": "hello"
        })
    ).toThrow()
})
