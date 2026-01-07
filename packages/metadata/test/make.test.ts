import { Metadata } from "@lib"

it("accepts all valid value keys", () => {
    const m = new Metadata({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye"
    })
    expect(m.get("%label")).toBe("Hello")
    expect(m.get("%label2")).toBe("World")
    expect(m.get("^annotation")).toBe("goodbye")
})

it("accepts mix of value and section keys", () => {
    const m = new Metadata({
        "%label": "Hello",
        "%label2": "World",
        "^annotation": "goodbye",

        "label/": {
            "^a": "A"
        }
    })
    expect(m.get("%label")).toBe("Hello")
    expect(m.get("%label2")).toBe("World")
    expect(m.get("^annotation")).toBe("goodbye")

    expect(m.get("^label/a")).toBe("A")

    expect(() => m.get("%x/")).toThrow()
})

describe("fails for different types of invalid keys", () => {
    it("invalid prefix", () => {
        expect(
            () =>
                new Metadata({
                    // @ts-expect-error
                    "@label": "Hello"
                })
        ).toThrow()
        expect(
            () =>
                new Metadata({
                    // @ts-expect-error
                    "(label": "Hello"
                })
        ).toThrow()
        expect(
            () =>
                new Metadata({
                    // @ts-expect-error
                    label: "Hello"
                })
        ).toThrow()
    })

    it("no prefix for non-special key", () => {
        expect(
            () =>
                new Metadata({
                    // @ts-expect-error
                    label: "Hello"
                })
        ).toThrow()

        expect(
            () =>
                new Metadata({
                    // @ts-expect-error
                    "label/": "Hello"
                })
        ).toThrow()
    })
})
it("section keys when appropriate", () => {
    expect(
        new Metadata({
            "f/": {
                "%x": "A"
            }
        }).get("%f/x")
    ).toBe("A")
    expect(
        new Metadata({
            "label/": {
                "^a": "A"
            }
        }).get("^label/a")
    ).toBe("A")
    expect(
        () =>
            new Metadata({
                "label/": {
                    // @ts-expect-error
                    a: "A"
                }
            })
    ).toThrow()
    expect(
        () =>
            new Metadata({
                // @ts-expect-error
                "%label/": "hello"
            })
    ).toThrow()
})
