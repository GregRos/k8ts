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

        "x/": {
            "%label": "section label"
        }
    })
})
