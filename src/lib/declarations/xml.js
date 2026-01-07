export default class XmlDeclaration {
	#version
	#encoding
	#isStandalone

	/**
	 * @note To be used within a Document Node.
	 * @param {object} [init]
	 * @param {string} [init.version] The version of the XML document (typically `"1.0"` or `"1.1"`)
	 * @param {string} [init.encoding] The encoding the document uses
	 * @param {boolean} [init.isStandalone] Whether the XML document uses internal data only (`true`) or if it requires external data (`false`)
	 */
	constructor(init) {
		if (Object.prototype.toString.call(init) !== "[object Object]") init = {}
		if (init.version) this.setVersion(init.version)
		if (init.encoding) this.setEncoding(init.encoding)
		if (typeof init.isStandalone === "boolean") this.setIsStandalone(init.isStandalone)
	}

	/**
	 * Checks if the given value is an XmlDeclaration.
	 *
	 * @param {unknown} value
	 * @returns {boolean}
	 */
	static isXmlDeclaration(value) {
		return value instanceof XmlDeclaration
	}

	/**
	 * The version of the XML document.
	 *
	 * @returns {string|undefined}
	 */
	get version() {
		return this.#version
	}

	/**
	 * The encoding used by the XML document.
	 *
	 * @returns {string|undefined}
	 */
	get encoding() {
		return this.#encoding
	}

	/**
	 * Whether the XML document uses internal data only (`true`) or if it requires external data (`false`).
	 *
	 * @returns {boolean|undefined}
	 */
	get isStandalone() {
		return this.#isStandalone
	}

	/**
	 * Sets the version of the XML document.
	 *
	 * @param {string} version
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	setVersion(version) {
		if (typeof version !== "string")
			throw new TypeError(`Expected version to be a string, instead got ${typeof version}`)

		version = version.trim()

		if (!version.length) throw new Error(`Expected version to have at least one character, instead got an empty string`)

		this.#version = version

		return this
	}

	/**
	 * Sets the encoding used by the XML document.
	 *
	 * @param {string} encoding
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	setEncoding(encoding) {
		if (typeof encoding !== "string")
			throw new TypeError(`Expected encoding to be a string, instead got ${typeof encoding}`)

		encoding = encoding.trim()

		if (!encoding.length)
			throw new Error(`Expected encoding to have at least one character, instead got an empty string`)

		this.#encoding = encoding

		return this
	}

	/**
	 * Sets whether the XML document uses internal data only (`true`) or if it requires external data (`false`).
	 *
	 * @param {boolean} bool
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	setIsStandalone(bool) {
		if (typeof bool !== "boolean") throw new TypeError(`Expected bool to be a boolean, instead got ${typeof bool}`)

		this.#isStandalone = bool

		return this
	}

	/**
	 * Removes the XML document's version.
	 *
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	removeVersion() {
		this.#version = undefined

		return this
	}

	/**
	 * Removes the XML document's encoding.
	 *
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	removeEncoding() {
		this.#encoding = undefined

		return this
	}

	/**
	 * Removes the standalone value from the XML document.
	 *
	 * @returns {XmlDeclaration} The instance for chaining
	 */
	removeIsStandalone() {
		this.#isStandalone = undefined

		return this
	}

	/**
	 * Converts the XML document to a String.
	 *
	 * @returns {string}
	 */
	toString() {
		const version = this.#version ? ` version="${this.#version}"` : ""
		const encoding = this.#encoding ? ` encoding="${this.#encoding}"` : ""
		const standalone = this.#isStandalone !== undefined ? ` standalone="${this.#isStandalone ? "yes" : "no"}"` : ""

		return `<?${version}${encoding}${standalone}?>`
	}
}
