# <p align="center">Virty</p>

_<p align="center">A class-based virtual DOM for XML and HTML. Designed to be as simple and flexible as possible.</p>_

> ⚠️ This library is still a work in progress. Expect bugs.

> ❔ Looking for a document parser for html/xml? Take a look at [flex-parse](https://github.com/jacoblockett/flex-parse). flex-parse uses virty under the hood as its document model of choice and offers extensively flexible and forgiving parsing strategies.<br/><br/>\*_flex-parse is a work in progress_

## Installation

```bash
npm i virty
```

## API Documentation

Detailed documentation can be found [here](https://jacoblockett.github.io/virty).

## Quickstart

Say we wanted to emulate this html structure:

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Home</title>
	</head>
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
</html>
```

The following would be one way to write this structure using virty:

```js
import { Node, DoctypeDeclaration, Document, Element, Text, Comment } from "virty"
// 'require' syntax is also possible, e.g. const { Node, ... } = require("virty")

// overall document node
const document = new Node({ type: Document })

// doctype declaration
const doctype = new DoctypeDeclaration({ element: "html" })

// element nodes
const html = new Node({ type: Element, name: "html" })
const head = new Node({ type: Element, name: "head" })
const title = new Node({ type: Element, name: "title" })
const body = new Node({ type: Element, name: "body" })
const mainDiv = new Node({ type: Element, name: "div", attributes: { id: "main" } })
const h1 = new Node({ type: Element, name: "h1" })
const formBlock = new Node({ type: Element, name: "div", attributes: { class: "form-block" } })
const message = new Node({ type: Element, name: "div", attributes: { class: "message" } })
const input = new Node({ type: Element, name: "input", attributes: { placeholder: "Type your name here" } })

// text nodes
const titleText = new Node({ type: Text, value: "Home" })
const h1Text = new Node({ type: Text, value: "Welcome back, Username!" })
const msgText = new Node({ type: Text, value: "Not Username? Type your name below!" })

// comment nodes
const qaComment = new Node({ type: Comment, value: "QA: should we put a submit button here?" })

// putting it all together
document
	.setDoctypeDeclaration(doctype)
	.appendChild(
		html.appendChild([
			head.appendChild(title.appendChild(titleText)),
			body.appendChild(
				mainDiv.appendChild([
					h1.appendChild(h1Text),
					formBlock.appendChild([message.appendChild(msgText), input, qaComment])
				])
			)
		])
	)
```
