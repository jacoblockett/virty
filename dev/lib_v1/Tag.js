import Text from "./Text.js"
import Comment from "./Comment.js"

/**
 * @typedef {Tag|Text|Comment} Node
 */

class Tag {
	#name
	#attributes = {}
	#children = []
	#parent = null
	#siblings = { next: null, previous: null }

	/**
	 * Creates a `Tag`, an element that's part of a document language such as HTML or XML.
	 *
	 * @param {string} tagName The tag name of the element
	 * @param {{[string]: string}|Node} attributesOrFirstChild The attributes of the element, or first child node if attributes is skipped
	 * @param  {...(string|Node)} children The remaining children nodes
	 */
	constructor(tagName, attributesOrFirstChild, ...children) {
		if (typeof tagName !== "string") throw new TypeError(`Expected tagName to be a string`)

		this.#name = tagName

		if (this.#isObjectLiteral(attributesOrFirstChild)) {
			for (const key in attributesOrFirstChild) {
				this.#validateStringInput(key, "attributeKey", false, true)
			}

			this.#attributes = attributesOrFirstChild
		} else if (attributesOrFirstChild) {
			children.unshift(attributesOrFirstChild)
		}

		children = children.flat()

		for (const child of children) {
			const childToAppend = typeof child === "string" ? new Text(child) : child

			this.#validateChildInput(childToAppend, "child")
			this.appendChild(childToAppend)
		}
	}

	static isTag(node) {
		return node instanceof Tag
	}

	static isNode(node) {
		return node instanceof Tag || node instanceof Text || node instanceof Comment
	}

	get TOM() {
		return {
			name: this.#name,
			attributes: Object.freeze({ ...this.#attributes }),
			children: Object.freeze([...this.#children]),
			parent: this.#parent,
			siblings: Object.freeze({ ...this.#siblings }),
		}
	}

	get name() {
		return this.#name
	}

	set name(name) {
		this.#validateStringInput(name, "name", false, true)

		this.#name = name
	}

	get attributes() {
		return Object.freeze({ ...this.#attributes })
	}

	set attributes(attributesObject) {
		if (!this.#isObjectLiteral(attributesObject))
			throw new TypeError(`Expected attributesObject to be an object literal`)

		this.#attributes = {}

		for (const attr in attributesObject) {
			this.attr(attr, attributesObject[attr])
		}
	}

	get children() {
		return Object.freeze([...this.#children])
	}

	set children(childrenArray) {
		if (!Array.isArray(childrenArray)) throw new TypeError(`Expected children to be an array`)

		for (let i = this.#children.length - 1; i >= 0; i--) {
			const child = this.#children[i]

			this.removeChild(child)
		}

		for (const child of childrenArray) {
			this.appendChild(child)
		}
	}

	get firstChild() {
		return this.#children[0] || null
	}

	get lastChild() {
		return this.#children[this.#children.length - 1] || null
	}

	get text() {
		if (!this.#children.length) return ""

		let content = ""

		for (let i = 0; i < this.#children.length; i++) {
			const child = this.#children[i]

			if (child.text) {
				content = `${content}${child.text}`
			}
		}

		return content
	}

	set text(content) {
		this.#validateStringInput(content, "content")

		this.#children = [new Text(content)]
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

	get isParent() {
		return !!this.#children.length
	}

	get isSibling() {
		return this.#parent?.children?.length > 1
	}

	get isOnlyChild() {
		return this.#parent?.children?.length === 1
	}

	get isChild() {
		return !!this.#parent
	}

	get isAncestor() {
		for (const child of this.#children) {
			if (child?.children?.length) return true
		}

		return false
	}

	get isDescendant() {
		return !!this.#parent?.parent
	}

	#isObjectLiteral(value) {
		return (
			typeof value === "object" &&
			value !== null &&
			value.constructor === Object &&
			Object.getPrototypeOf(value) === Object.prototype
		)
	}

	#validateChildInput(child, argName = "argument", nullAllowed = false) {
		if (!nullAllowed && child === null) {
			throw new TypeError(
				`Expected ${argName} to be an instance of Tag, Text, or Comment. null is not allowed`,
			)
		}
		if (child !== null && !Tag.isNode(child)) {
			throw new TypeError(`Expected ${argName} to be an instance of Tag, Text, or Comment`)
		}
	}

	#validateStringInput(string, argName = "argument", emptyAllowed = true, trim = false) {
		if (typeof string !== "string") throw new TypeError(`Expected ${argName} to be a string`)
		if (!emptyAllowed) {
			if (trim) string = string.trim()
			if (string.length === 0) throw new TypeError(`Expected ${argName} to be a non-empty string`)
		}
	}

	#getIndexOfChild(child) {
		const index = this.#children.indexOf(child)

		if (index === -1)
			throw new Error(`The queried child does not exist within the children of this Tag`)

		return index
	}

	#childSpliceOp(existingNode, distanceFromIndex, deleteCount, ...newNodes) {
		this.#validateChildInput(existingNode, "existingNode")

		const index = this.#getIndexOfChild(existingNode)
		const siblings = {
			previous: this.#children[index - 1],
			next: this.#children[index + 1],
		}

		for (const newNode of newNodes) {
			this.#validateChildInput(newNode, "newNode")
		}

		this.#children.splice(index + distanceFromIndex, deleteCount, ...newNodes)

		return siblings
	}

	nthChild(index) {
		if (!Number.isInteger(index)) throw new TypeError(`Expected index to be a number`)

		if (index < 0) index = this.children.length + index
		if (index < 0 || index >= this.children.length) return null

		return this.children[index]
	}

	clone(options = {}) {
		if (!this.#isObjectLiteral(options)) options = {}

		options.deep = typeof options.deep === "boolean" ? options.deep : false

		const rootClone = new Tag(this.name, this.attributes)

		if (options.deep) {
			const queue = [{ original: this, clone: rootClone }]

			while (queue.length > 0) {
				const { original, clone } = queue.shift()

				for (const child of original.children) {
					let childClone

					if (Tag.isTag(child)) {
						childClone = new Tag(child.name, child.attributes)

						queue.push({ original: child, clone: childClone })
					} else if (Text.isText(child)) {
						childClone = new Text(child.text)
					} else if (Comment.isComment(child)) {
						childClone = new Comment(child.content)
					} else {
						throw new Error(`An unknown child was found: ${child}`)
					}

					clone.appendChild(childClone)
				}
			}
		}

		return rootClone
	}

	render(options = {}) {
		if (!this.#isObjectLiteral(options)) options = {}

		options.indent = Number.isInteger(options.indent) && options.indent >= 0 ? options.indent : 0
		options.indentChar = typeof options.indentChar === "string" ? options.indentChar : " "

		let output = ""

		const stack = [{ node: this, depth: 0, childIndex: 0 }]

		while (stack.length > 0) {
			const { node, depth, childIndex } = stack.pop()
			const indentString = options.indentChar.repeat(depth * options.indent)
			const newLineString = options.indent ? "\n" : ""

			// opening tag
			if (childIndex === 0) {
				if (Tag.isTag(node)) {
					const attributesString = Object.entries(node.attributes)
						.map(([key, value]) => ` ${key}="${value}"`)
						.join("")

					output += `${indentString}<${node.name}${attributesString}>${newLineString}`
				} else if (Text.isText(node)) {
					output += `${indentString}${node.text}`
				} else if (Comment.isComment(node)) {
					output += `${indentString}<!--${node.content}-->`
				}
			}

			// process children
			if (node.children && childIndex < node.children.length) {
				stack.push({ node, depth, childIndex: childIndex + 1 }) // push the current node back onto the stack for 'recursive' processing
				stack.push({ node: node.children[childIndex], depth: depth + 1, childIndex: 0 }) // push the child onto the stack to be processed next
				continue
			}

			// closing tag (when the above 'continue' statement is no longer called, that means all the children available have been processed)
			if (Tag.isTag(node)) {
				output += `${indentString}</${node.name}>${newLineString}`
			} else {
				output += newLineString
			}
		}

		return output
	}

	addAttr(nameOrObject, value) {
		if (typeof nameOrObject === "string") {
			nameOrObject = { [nameOrObject]: value }
		}

		if (!this.#isObjectLiteral(nameOrObject))
			throw new TypeError(
				`Expected nameOrObject and value to be parsable into [... { [name]: value } ]`,
			)

		for (const attrName in nameOrObject) {
			this.#validateStringInput(attrName, "attributeName", false, true)
			this.#validateStringInput(nameOrObject[attrName], "value")

			this.#attributes[attrName] = nameOrObject[attrName]
		}

		return this
	}

	removeAttr(...names) {
		for (const name of names) {
			this.#validateStringInput(name, "name", false, true)

			delete this.#attributes[name]
		}

		return this
	}

	addClass(...classNames) {
		for (const className of classNames) {
			this.#validateStringInput(className, "className", false, true)
		}

		const existingClasses = this.#attributes?.class?.split(/\s+/) || []

		this.#attributes.class = [...new Set([...existingClasses, ...classNames])].join(" ")

		return this
	}

	removeClass(...classNames) {
		for (const className of classNames) {
			this.#validateStringInput(className, "className", false, true)
		}

		const existingClasses = this.#attributes?.class?.split(/\s+/) || []

		if (existingClasses.length) {
			const updatedClasses = existingClasses
				.filter(className => !classNames.includes(className))
				.join(" ")

			if (updatedClasses) {
				this.#attributes.class = updatedClasses
			} else {
				delete this.#attributes.class
			}
		}

		return this
	}

	toggleClass(name) {
		this.#validateStringInput(name, "name", false, true)

		if (this.attributes?.class?.includes(name)) {
			this.removeClass(name)
		} else {
			this.addClass(name)
		}

		return this
	}

	appendChild(...nodes) {
		let prevNode = this.#children[this.#children.length - 1]
		for (const node of nodes) {
			this.#validateChildInput(node, "node")

			if (node.parent) {
				node.parent.removeChild(node)
			}

			node.parent = this

			if (prevNode) {
				prevNode.nextSibling = node
				node.previousSibling = prevNode
			}

			prevNode = node
		}

		this.#children.push(...nodes)

		return this
	}

	prependChild(...nodes) {
		let nextNode = this.#children[0]
		for (let i = nodes.length - 1; i >= 0; i--) {
			const node = nodes[i]
			this.#validateChildInput(node, "node")

			if (node.parent) {
				node.parent.removeChild(node)
			}

			node.parent = this

			if (nextNode) {
				nextNode.previousSibling = node
				node.nextSibling = nextNode
			}

			nextNode = node
		}

		this.#children.unshift(...nodes)

		return this
	}

	removeChild(...nodes) {
		for (const node of nodes) {
			this.#validateChildInput(node, "node")

			node.parent = null
			node.nextSibling = null
			node.previousSibling = null

			const { previous, next } = this.#childSpliceOp(node, 0, 1)

			if (previous) previous.nextSibling = next || null
			if (next) next.previousSibling = previous || null
		}

		return this
	}

	replaceChild(existingNode, ...newNodes) {
		this.#validateChildInput(existingNode, "existingNode")

		existingNode.parent = null
		existingNode.nextSibling = null
		existingNode.previousSibling = null

		const { previous, next } = this.#childSpliceOp(existingNode, 0, 1, ...newNodes)

		let previousNode = previous
		for (const newNode of newNodes) {
			newNode.parent = this

			if (previousNode) {
				previousNode.nextSibling = newNode
				newNode.previousSibling = previousNode
			}

			previousNode = newNode
		}

		const lastNewNode = newNodes[newNodes.length - 1]

		if (next) {
			next.previousSibling = lastNewNode
			lastNewNode.nextSibling = next
		}

		return this
	}

	appendSibling(existingNode, ...newNodes) {
		this.#validateChildInput(existingNode, "existingNode")

		const { next } = this.#childSpliceOp(existingNode, 1, 0, ...newNodes)

		let previousNode = existingNode
		for (const newNode of newNodes) {
			newNode.parent = this
			previousNode.nextSibling = newNode
			newNode.previousSibling = previousNode
			previousNode = newNode
		}

		const lastNewNode = newNodes[newNodes.length - 1]

		if (next) {
			next.previousSibling = lastNewNode
			lastNewNode.nextSibling = next
		}

		return this
	}

	prependSibling(existingNode, ...newNodes) {
		this.#validateChildInput(existingNode, "existingNode")

		const { previous } = this.#childSpliceOp(existingNode, 0, 0, ...newNodes)

		let nextNode = existingNode
		for (let i = newNodes.length - 1; i >= 0; i--) {
			const newNode = newNodes[i]

			newNode.parent = this
			nextNode.previousSibling = newNode
			newNode.nextSibling = nextNode
			nextNode = newNode
		}

		const firstNewNode = newNodes[0]

		if (previous) {
			previous.nextSibling = firstNewNode
			firstNewNode.previousSibling = previous
		}

		return this
	}

	isDirectSiblingOf(node) {
		this.#validateChildInput(node, "node")

		return node.previousSibling === this || node.nextSibling === this
	}

	isSiblingOf(node) {
		this.#validateChildInput(node, "node")

		return node.parent === this.parent
	}

	isParentOf(node) {
		this.#validateChildInput(node, "node")

		return this === node.parent
	}

	isChildOf(node) {
		this.#validateChildInput(node, "node")

		return this.parent === node
	}

	isAncestorOf(node) {
		if (!this.#validateChildInput(node, "node")) return false

		while (node.parent) {
			if (node.parent === this) return true
			node = node.parent
		}

		return false
	}

	isDescendantOf(node) {
		this.#validateChildInput(node, "node")

		let current = this.parent
		while (current) {
			if (current === node) return true
			current = current.parent
		}

		return false
	}
}

export default Tag
