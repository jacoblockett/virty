import Tag from "./Tag.js"
import Text from "./Text.js"

class Comment {
	#content
	#parent = null
	#siblings = { previous: null, next: null }

	constructor(content) {
		if (typeof content !== "string") throw new TypeError(`Expected content to be a string`)

		this.#content = content
	}

	static isComment(node) {
		return node instanceof Comment
	}

	static isNode(node) {
		return node instanceof Tag || node instanceof Text || node instanceof Comment
	}

	get TOM() {
		return {
			content: this.#content,
			parent: this.#parent,
			siblings: Object.freeze({ ...this.#siblings }),
		}
	}

	get content() {
		return this.#content
	}

	set content(newContent) {
		this.#validateStringInput(newContent, "newContent")

		this.#content = newContent
	}

	get parent() {
		return this.#parent
	}

	set parent(node) {
		this.#validateChildInput(node, "node", true)

		this.#parent = node
	}

	get previousSibling() {
		return this.#siblings.previous
	}

	set previousSibling(node) {
		this.#validateChildInput(node, "node", true)

		this.#siblings.previous = node
	}

	get nextSibling() {
		return this.#siblings.next
	}

	set nextSibling(node) {
		this.#validateChildInput(node, "node", true)

		this.#siblings.next = node
	}

	#validateStringInput(string, argName = "argument", emptyAllowed = true, trim = false) {
		if (typeof string !== "string") throw new TypeError(`Expected ${argName} to be a string`)
		if (!emptyAllowed) {
			if (trim) string = string.trim()
			if (string.length === 0) throw new TypeError(`Expected ${argName} to be a non-empty string`)
		}
	}

	#validateChildInput(child, argName = "argument", nullAllowed = false) {
		if (!nullAllowed && child === null) {
			throw new TypeError(
				`Expected ${argName} to be an instance of Tag, Text, or Comment. null is not allowed`,
			)
		}
		if (child !== null && !Tag.isTag(child) && !Text.isText(child) && !Comment.isComment(child)) {
			throw new TypeError(`Expected ${argName} to be an instance of Tag, Text, or Comment`)
		}
	}

	clone() {
		return new Comment(this.content)
	}

	isSiblingOf(node) {
		this.#validateChildInput(node, "node")

		return node.previousSibling === this || node.nextSibling === this
	}

	isParentOf(node) {
		return false
	}

	isChildOf(node) {
		this.#validateChildInput(node, "node")

		return this.parent === node
	}
}

export default Comment
