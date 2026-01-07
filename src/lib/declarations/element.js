export default class ElementDeclaration {
	#name
	#rules

	/**
	 * @note To be used within `DoctypeDeclaration`
	 * @param {object} [init]
	 * @param {string} [init.name] The name of the ElementDeclaration
	 * @param {string} [init.rules] The rules of the ElementDeclaration
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]") init = {}
		if (init.name) this.setName(init.name)
		if (init.rules) this.setRules(init.rules)
	}

	/**
	 * Checks if the given value is an ElementDeclaration.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isElementDeclaration(value) {
		return value instanceof ElementDeclaration
	}

	/**
	 * The name of the ElementDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get name() {
		return this.#name
	}

	/**
	 * The content rules of the ElementDeclaration.
	 *
	 * @returns {string|undefined}
	 */
	get rules() {
		return this.#rules
	}

	/**
	 * Sets the name of the ElementDeclaration.
	 *
	 * @param {string} name
	 * @returns {ElementDeclaration} The instance for chaining
	 */
	setName(name) {
		if (typeof name !== "string") throw new TypeError(`Expected name to be a string, instead got ${typeof name}`)

		name = name.trim()

		if (!name.length) throw new Error(`Expected name to have at least one character, instead got an empty string`)

		this.#name = name

		return this
	}

	/**
	 * Sets the content rules of the ElementDeclaration.
	 *
	 * @param {string} rules
	 * @returns {ElementDeclaration} The instance for chaining
	 */
	setRules(rules) {
		if (typeof rules !== "string") throw new TypeError(`Expected rules to be a string, instead got ${typeof rules}`)

		rules = rules.trim()

		if (!rules.length) throw new Error(`Expected rules to have at least one character, instead got an empty string`)

		this.#rules = rules

		return this
	}

	/**
	 * Removes the name from the ElementDeclaration.
	 *
	 * @returns {ElementDeclaration} The instance for chaining
	 */
	removeName() {
		this.#name = undefined

		return this
	}

	/**
	 * Removes the content rules from the ElementDeclaration.
	 *
	 * @returns {ElementDeclaration} The instance for chaining
	 */
	removeRules() {
		this.#rules = undefined

		return this
	}

	/**
	 * Converts the ElementDeclaration declaration to a String.
	 *
	 * @returns {string}
	 */
	toString() {
		const name = this.#name ? ` ${this.#name}` : ""
		const rules = this.#rules ? ` ${this.#rules}` : ""

		return `<!ELEMENT${name}${rules}>`
	}
}
