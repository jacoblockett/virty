import Node, { COMMENT, ELEMENT, TEXT } from "../index.js"

// const createComment = value => new Node({ type: COMMENT, value })
// const createElement = (tagName, attributes, children, selfClosing) =>
// 	new Node({ type: ELEMENT, tagName, attributes, children, selfClosing })
// const createText = value => new Node({ type: TEXT, value })

// const doc = createElement("body", {}, [
// 	createElement("div", { id: "main" }, [
// 		createElement("h1", {}, [createText("Welcome back, Username!")]),
// 		createElement("div", { class: "form-block" }, [
// 			createElement("div", { class: "message" }, [createText("Not Username? Type your name below!")]),
// 			createElement("input", { placeholder: "Type your name here" }, [], true),
// 			createComment("<!-- QA: should we put a submit button here? -->")
// 		])
// 	])
// ])

// console.log(`"${doc.children[0].text}"`)

const n = new Node({
	type: ELEMENT,
	tagName: "div",
	attributes: { class: "a b c" }
})

n.toggleClass("b", "d")

console.log(`"${n.attributes.class}"`)
