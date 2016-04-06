# react-component-metadata

parse react components for prop data and descriptions as well as leading comments

## Install

```sh
npm i -S react-component-metadata
```

## Use

```
var metadata = require('react-component-metadata')
var fs = require('fs')

var result = metadata(fs.readFileSync('./Modal.jsx', 'utf8'), options)
```

`result` will be an object hash with component names as keys

```js
{
    // component name is either the Identifier name, displayName, the value of the @alias or @name doclet if it exists.
    Modal: {
        desc: 'A modal component' //the component leading comment
        props: {
            show: {
              type: { name: 'object' },
              required: false,
              desc: 'Show or hide the modal Component.' //the prop type leading comment
            }
        }
    }
}
```

You can also use `metadata.parseDoclets` to parse the JSDoc values out of the comments.

#### Options

- `mixins`: default false, Parse Mixins as components, will have an additional `mixin: true` property on the component metadata. Setting this to `true` will also try and parse mixins in createClass components and add them to the `mixins` property.
