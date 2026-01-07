import AttListDeclaration from "./attlist.js"
import ElementDeclaration from "./element.js"
import EntityDeclaration from "./entity.js"

export default class DoctypeDeclaration {
	#element
	#formalPublicIdentifier
	#systemIdentifier
	#internalSubset

	/**
	 * @note To be used within a Document Node.
	 * @param {object} [init]
	 * @param {string} [init.element] The name of the root element of the document
	 * @param {string} [init.formalPublicIdentifier] The FPI (Formal Public Identifier), or ID that corresponds to a key publicly available lookup table
	 * @param {string} [init.systemIdentifier] The URI corresponding to the external DTD (Document Type Declaration) resource
	 * @param {(AttListDeclaration|ElementDeclaration|EntityDeclaration)[]} [init.internalSubset] The internal subset of rules to use (overrides all identifiers)
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]") init = {}
		if (init.element) this.setElement(init.element)
		if (init.formalPublicIdentifier) this.setFormalPublicIdentifier(init.formalPublicIdentifier)
		if (init.systemIdentifier) this.setSystemIdentifier(init.systemIdentifier)
		if (init.internalSubset) this.setInternalSubset(init.internalSubset)
	}

	/**
	 * Checks if the given value is an DoctypeDeclaration.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isDoctypeDeclaration(value) {
		return value instanceof DoctypeDeclaration
	}

	/**
	 * The name of the root element of the document.
	 *
	 * @returns {string|undefined}
	 */
	get element() {
		return this.#element
	}

	/**
	 * The Formal Public Identifier (FPI), or ID that corresponds to a key on a public lookup table.
	 *
	 * @returns {string|undefined}
	 */
	get formalPublicIdentifier() {
		return this.#formalPublicIdentifier
	}

	/**
	 * The System Identifier URI, or storage location of the Document Type Declaration (DTD).
	 *
	 * @returns {string|undefined}
	 */
	get systemIdentifier() {
		return this.#systemIdentifier
	}

	/**
	 * The Internal Subset of rules used in place of a separate DTD file or resource.
	 *
	 * @returns {(AttList|Element|Entity)[]}
	 */
	get internalSubset() {
		return this.#internalSubset
	}

	/**
	 * Sets the name of the root element of the document.
	 *
	 * @param {string} name
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	setElement(name) {
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an emtpy string`)

		this.#element = name

		return this
	}

	/**
	 * Sets the Formal Public Identifier (FPI), or ID that corresponds to a key on a public lookup table.
	 *
	 * @param {string} id
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	setFormalPublicIdentifier(id) {
		if (typeof id !== "string") throw new TypeError(`Expected id to be a string, instead got ${typeof id}`)

		this.#formalPublicIdentifier = id

		return this
	}

	/**
	 * Sets the System Identifier URI, or storage location of the Document Type Declaration (DTD).
	 *
	 * @param {string} uri
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	setSystemIdentifier(uri) {
		if (typeof uri !== "string") throw new TypeError(`Expected uri to be a string, instead got ${typeof uri}`)

		this.#systemIdentifier = uri

		return this
	}

	/**
	 * Sets the Internal Subset of rules used in place of a separate DTD file or resource.
	 *
	 * @param {(AttListDeclaration|ElementDeclaration|EntityDeclaration)[]} subset
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	setInternalSubset(subset) {
		if (!Array.isArray(subset)) throw new TypeError(`Expected subset to be an array, instead got ${typeof subset}`)
		if (!subset.length) throw new Error(`Expected subset to have at least one rule, instead got an empty array`)

		for (const rule of subset) {
			if (
				!AttListDeclaration.isAttListDeclaration(rule) &&
				!ElementDeclaration.isElementDeclaration(rule) &&
				!EntityDeclaration.isEntityDeclaration(rule)
			)
				throw new TypeError(
					`Expected each item of subset to be one of AttListDeclaration|ElementDeclaration|EntityDeclaration, instead found ${typeof rule}`
				)
		}

		this.#internalSubset = subset

		return this
	}

	/**
	 * Removes the name of the root element of the document.
	 *
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	removeElement() {
		this.#element = undefined

		return this
	}

	/**
	 * Removes the Formal Public Identifier (FPI), or ID that corresponds to a key on a public lookup table.
	 *
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	removeFormalPublicIdentifier() {
		this.#formalPublicIdentifier = undefined

		return this
	}

	/**
	 * Removes the System Identifier URI, or storage location of the Document Type Declaration (DTD).
	 *
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	removeSystemIdentifier() {
		this.#systemIdentifier = undefined

		return this
	}

	/**
	 * Removes the Internal Subset of rules used in place of a separate DTD file or resource.
	 *
	 * @returns {DoctypeDeclaration} The instance for chaining
	 */
	removeInternalSubset() {
		this.#internalSubset = undefined

		return this
	}

	/**
	 * Converts the DoctypeDeclaration into a String.
	 *
	 * @returns {string}
	 */
	toString() {
		const element = this.#element ? ` ${this.#element}` : ""
		const keyword = this.#formalPublicIdentifier ? " PUBLIC" : this.#systemIdentifier ? " SYSTEM" : ""
		const fpid = this.#formalPublicIdentifier ? ` ${this.#formalPublicIdentifier}` : ""
		const sid = this.#systemIdentifier ? ` ${this.#systemIdentifier}` : ""
		const subset = this.#internalSubset ? ` [${this.#internalSubset.map(x => x.toString()).join(", ")}]` : ""

		return `<!DOCTYPE${element}${keyword}${fpid}${sid}${subset}>`
	}
}
