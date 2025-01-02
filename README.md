# Virty

> ⚠️ This library is in its early stages of development. Expect bugs, and expect them to be plentiful. Until a v1.0.0 release, this message will persist.

A class-based virtual dom structure intended to be as brain-dead as possible to use.

> ❔ Looking for a document parser for html/xml? Take a look at [flex-parse](https://github.com/jacoblockett/flex-parse). Flex-parse uses virty under the hood as its document model of choice and offers extensively flexible* parsing strategies.<br/><br/>*_Currently a work in progress, but basic element, text, and comment parsing is available_

## Installation

The release on Github prior to v1.0.0 will likely be the best place to install from. Development may be sporadic and/or rapid at times, and I won't always be pushing the latest updates to NPM.

```bash
# Latest release
pnpm i "https://github.com/jacoblockett/virty"
```

```bash
# Release hosted on NPM
pnpm i virty
```

## Quickstart

Say we wanted to emulate this html structure:

```html
<body>
	<div id="main">
		<h1>Welcome back, Username!</h1>
		<div class="form-block">
			<div class="message">Not Username? Type your name below!</div>
			<input placeholder="Type your name here" />
			<!-- QA: should we put a submit button here? -->
		</div>
	</div>
</body>
```

At the most basic level, this would be the equivalent virty code:

```js
// COMMENT, ELEMENT, and TEXT are simple string constants exported for convenience's sake
import Node, { COMMENT, ELEMENT, TEXT } from "virty"

// element nodes
const body = new Node({ type: ELEMENT, tagName: "body" })
const mainDiv = new Node({ type: ELEMENT, tagName: "div", attributes: { id: "main" } })
const h1 = new Node({ type: ELEMENT, tagName: "h1" })
const formBlock = new Node({ type: ELEMENT, tagName: "div", attributes: { class: "form-block" } })
const message = new Node({ type: ELEMENT, tagName: "div", attributes: { class: "message" } })
const input = new Node({ type: ELEMENT, tagName: "input", attributes: { placeholder: "Type your name here" } })

// text nodes
const h1Text = new Node({ type: TEXT, value: "Welcome back, Username!" })
const msgText = new Node({ type: TEXT, value: "Not Username? Type your name below!" })

// comment nodes
const qaComment = new Node({ type: COMMENT, value: "<!-- QA: should we put a submit button here? -->" })

// putting it all together
body.appendChild(mainDiv)
mainDiv.appendChild(h1, formBlock)
h1.appendChild(h1Text)
formBlock.appendChild(message, input, qaComment)
message.appendChild(msgText)
```

Another way to write the same thing would be to make use of the `children` option in the Node classes' constructors:

```js
import Node, { COMMENT, ELEMENT, TEXT } from "virty"

const doc = new Node({
	type: ELEMENT,
	tagName: "body",
	children: [
		new Node({
			type: ELEMENT,
			tagName: "div",
			attributes: { id: "main" },
			children: [
				new Node({
					type: ELEMENT,
					tagName: "h1",
					children: [new Node({ type: TEXT, value: "Welcome back, Username!" })]
				}),
				new Node({
					type: ELEMENT,
					tagName: "div",
					attributes: { class: "form-block" },
					children: [
						new Node({
							type: ELEMENT,
							tagName: "div",
							attributes: { class: "message" },
							children: [new Node({ type: TEXT, value: "Not Username? Type your name below!" })]
						}),
						new Node({
							type: ELEMENT,
							tagName: "input",
							attributes: { placeholder: "Type your name here" }
						}),
						new Node({
							type: COMMENT,
							value: "<!-- QA: should we put a submit button here? -->"
						})
					]
				})
			]
		})
	]
})
```

And finally, if you prefer a more custom functional approach:

```js
import Node, { COMMENT, ELEMENT, TEXT } from "virty"

const createComment = value => new Node({ type: COMMENT, value })
const createElement = (tagName, attributes, children) => new Node({ type: ELEMENT, tagName, attributes, children })
const createText = value => new Node({ type: TEXT, value })

const doc = createElement("body", {}, [
	createElement("div", { id: "main" }, [
		createElement("h1", {}, [createText("Welcome back, Username!")]),
		createElement("div", { class: "form-block" }, [
			createElement("div", { class: "message" }, [createText("Not Username? Type your name below!")]),
			createElement("input", { placeholder: "Type your name here" }),
			createComment("<!-- QA: should we put a submit button here? -->")
		])
	])
])
```

Generally speaking, this library isn't designed for you to be manually creating document structures like this. If you want to, by all means, but you should think of this library as a lower-level driver to produce something higher level, such as results for a parser, a dynamic structure generator based on user input, etc.

## API

### Signature:

```ts
class Node(init: {
    type: "comment"|"element"|"text",
    tagName?: string,
    attributes?: { [name: string]: string|number|boolean },
    children?: Node[],
    value?: string,
}): Node
```

### Init options:

| Name       | Type                                          | Required                                               | Default                                                | Description                                                |
| ---------- | --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| type       | `Enum("comment"\|"element"\|"text")`          | Yes                                                    |                                                        | The case-*in*sensitive type of the node                    |
| tagName    | `string`                                      | If the element includes attributes, yes, otherwise, no | `"element"`: `""`<br/>`"comment"\|"text"`: `undefined` | Case-sensitive tag name to use with `"element"` nodes      |
| attributes | `{ [name: string]: string\|number\|boolean }` | No                                                     | `"element"`: `{}`<br/>`"comment"\|"text"`: `undefined` | Attribute values to use with `"element"` nodes             |
| children   | `Node[]`                                      | No                                                     | `"element"`: `[]`<br/>`"comment"\|"text"`: `undefined` | Child nodes to append to `"element"` nodes                 |
| value      | `string`                                      | No                                                     | `"element"`: `undefined`<br/>`"comment"\|"text"`: `""` | The text content to use with `"comment"` or `"text"` nodes |

> 💡 `"element"` nodes will ignore the value option, and `"comment"|"text"` nodes will ignore the tagName, attributes, and children options.

---

### Methods, Getters, Setters:

- [`static Node.isComment`](#nodeiscomment-)
- [`static Node.isElement`](#nodeiselement-)
- [`static Node.isNode`](#nodeisnode-)
- [`static Node.isText`](#nodeistext-)
- [`get Node.prototype.attributes`](#nodeprototypeattributes-)
- [`get Node.prototype.children`](#nodeprototypechildren-)
- [`get Node.prototype.next`](#nodeprototypenext-)
- [`get Node.prototype.parent`](#nodeprototypeparent-)
- [`get Node.prototype.previous`](#nodeprototypeprevious-)
- [`get Node.prototype.root`](#nodeprototyperoot-)
- [`get Node.prototype.tagName`](#nodeprototypetagname-)
- [`get Node.prototype.type`](#nodeprototypetype-)
- [`get Node.prototype.value`](#nodeprototypevalue-)
- [`function Node.prototype.appendChild`](#nodeprototypeappendchild-)
- [`function Node.prototype.appendSibling`](#nodeprototypeappendsibling-)
- [`function Node.prototype.removeChild`](#nodeprototyperemovechild-)

### `Node.isComment` [🔝](#methods-getters-setters)

```ts
static Node.isComment(value: unknown): boolean
```

Checks if the given value is a comment node.

Example:

```js
Node.isComment("<!-- comment -->") // false
Node.isComment(new Node({ type: COMMENT, value: "<!-- comment -->" })) // true
```

---

### `Node.isElement` [🔝](#methods-getters-setters)

```ts
static Node.isElement(value: unknown): boolean
```

Checks if the given value is an element node.

Example:

```js
Node.isElement("div") // false
Node.isElement(new Node({ type: ELEMENT, tagName: "div" })) // true
```

---

### `Node.isNode` [🔝](#methods-getters-setters)

```ts
static Node.isNode(value: unknown): boolean
```

Checks if the given value is a node.

Example:

```js
Node.isNode("text") // false
Node.isNode(new Node({ type: COMMENT, value: "<!-- comment -->" })) // true
Node.isNode(new Node({ type: ELEMENT, tagName: "div" })) // true
Node.isNode(new Node({ type: TEXT, value: "text" })) // true
```

---

### `Node.isText` [🔝](#methods-getters-setters)

```ts
static Node.isText(value: unknown): boolean
```

Checks if the given value is a text node.

Example:

```js
Node.isText("text") // false
Node.isText(new Node({ type: TEXT, value: "text" })) // true
```

---

### `Node.prototype.attributes` [🔝](#methods-getters-setters)

```ts
get attributes(): { [name: string]: string|number|boolean } | undefined
```

The attributes of the node.

Example:

```js
const n = new Node({ type: ELEMENT, tagName: "div", attributes: { class: "a b c" } })

n.attributes.class // "a b c"
```

---

### `Node.prototype.children` [🔝](#methods-getters-setters)

```ts
get children(): Node[] | undefined
```

The children of the node.

Example:

```js
const n = new Node({ type: ELEMENT, children: [new Node({ type: ELEMENT }), new Node({ type: TEXT })] })

n.children // [ Node {}, Node {} ], i.e. [ Node { ELEMENT }, Node { TEXT } ]
```

---

### `Node.prototype.next` [🔝](#methods-getters-setters)

```ts
get next(): Node | undefined
```

The next sibling node.

Example:

```js
const n = new Node({ type: ELEMENT, children: [new Node({ type: ELEMENT }), new Node({ type: TEXT })] })

n.next // undefined
n.children[0].next // Node {}, i.e. Node { TEXT }
```

---

### `Node.prototype.parent` [🔝](#methods-getters-setters)

```ts
get parent(): Node | undefined
```

The parent node.

Example:

```js
const n = new Node({ type: ELEMENT, children: [new Node({ type: ELEMENT }), new Node({ type: TEXT })] })

n.parent // undefined
n.children[0].parent // Node {}, i.e. Node { ELEMENT (n) }
```

---

### `Node.prototype.previous` [🔝](#methods-getters-setters)

```ts
get previous(): Node | undefined
```

The previous sibling node.

Example:

```js
const n = new Node({ type: ELEMENT, children: [new Node({ type: ELEMENT }), new Node({ type: TEXT })] })

n.previous // undefined
n.children[1].previous // Node {}, i.e. Node { ELEMENT }
```

---

### `Node.prototype.root` [🔝](#methods-getters-setters)

```ts
get root(): Node
```

The root node.

Example:

```js
const n = new Node({
	type: ELEMENT,
	children: [new Node({ type: ELEMENT, children: [new Node({ type: ELEMENT })] }), new Node({ type: TEXT })]
})

n.children[0].children[0].root // Node {}, i.e. Node { ELEMENT (n) }
```

---

### `Node.prototype.tagName` [🔝](#methods-getters-setters)

```ts
get tagName(): string | undefined
```

The tag name of the node.

Example:

```js
const n = new Node({ type: ELEMENT, tagName: "div" })

n.tagName // "div"
```

---

### `Node.prototype.type` [🔝](#methods-getters-setters)

```ts
get type(): "comment" | "element" | "text"
```

The type of the node.

Example:

```js
const n = new Node({ type: ELEMENT })

n.type // "element"
```

---

### `Node.prototype.value` [🔝](#methods-getters-setters)

```ts
get value(): string | undefined
```

The value of the node.

> ⚠️ This is **not** the value attribute of an element node, such as an `<input>` element's value, for example. To access that, use Node.prototype.attributes.value instead.

Example:

```js
const n = new Node({ type: TEXT, value: "Lorem ipsum..." })

n.value // "Lorem ipsum..."
```

---

### Node.prototype.appendChild [🔝](#methods-getters-setters)

```ts
function appendChild(...nodes: (Node | Node[])[]): Node
```

Appends the given child or children to the node. You can pass multiple nodes as arguments or an array of nodes. Appended children will lose any and all parent and sibling references should they already exist. `"comment"` and `"text"` nodes will do nothing. Returns itself for chaining.

Example:

```js
const parent = new Node({ type: ELEMENT })
const child1 = new Node({ type: TEXT })
const child2 = new Node({ type: TEXT })

parent.appendChild(child1, child2)
// or parent.appendChild([child1, child2])
// or parent.appendChild(child1).appendChild(child2)

parent.children // [ Node {}, Node {} ], i.e. [ Node { TEXT (child1) }, Node { TEXT (child2) } ]
```

---

### Node.prototype.appendSibling [🔝](#methods-getters-setters)

```ts
function appendSibling(...nodes: (Node | Node[])[]): Node
```

Appends the given sibling or siblings to the node. You can pass multiple nodes as arguments or an array of nodes. Appended siblings will lose any and all parent and sibling references should they already exist. Returns itself for chaining.

Example:

```js
const parent = new Node({ type: ELEMENT })
const child1 = new Node({ type: TEXT })
const child2 = new Node({ type: TEXT })

parent.appendChild(child1)
child1.appendSibling(child2)

parent.children // [ Node {}, Node {} ], i.e. [ Node { TEXT (child1) }, Node { TEXT (child2) } ]
```

---

### Node.prototype.removeChild [🔝](#methods-getters-setters)

```ts
function removeChild(...nodes: (Node | Node[])[]): Node
```

Removes the given child or children from the node. You can pass multiple nodes as arguments or an array of nodes. Nodes of type "comment" and "text", and nodes with no children, will do nothing. Returns itself for chaining.

Example:

```js
const parent = new Node({ type: ELEMENT })
const child1 = new Node({ type: TEXT })
const child2 = new Node({ type: TEXT })

parent.appendChild(child1, child2).removeChild(child1)

parent.children // [ Node {} ], i.e. [ Node { TEXT (child2) } ]
```

---
