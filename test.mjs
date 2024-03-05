import test from 'tape'
import { transform, composeVisitors } from 'lightningcss'
import shadySelectors from './plugin.mjs'

test('should convert :host selector', t => {
  const result = transform({
    minify: true,
    code: Buffer.from(`:host { background: blue; }`),
    visitor: composeVisitors([
      shadySelectors({ scopeTo: 'my-tag' })
    ])
  })
  const actual = result.code.toString()
  const expected = 'my-tag{background:#00f}'
  t.equal(actual, expected, 'Converts :host selector to scope')
  t.end()
})

test('should convert host with arguments', t => {
  const result = transform({
    minify: true,
    code: Buffer.from(':host(.something) div { background:blue; }'),
    visitor: composeVisitors([
      shadySelectors({ scopeTo: 'my-tag' })
    ])
  })
  const actual = result.code.toString()
  const expected = 'my-tag.something div{background:#00f}'
  t.equal(actual, expected, 'Converts :host selector with argument')
  t.end()
})

test('should convert ::slotted selector with arguments', t => {
  const result = transform({
    minify: true,
    code: Buffer.from(`
      .container > ::slotted([slot="title"]) {
        display: block;
      }
    `),
    visitor: composeVisitors([
      shadySelectors({ scopeTo: 'my-tag' })
    ])
  })
  const actual = result.code.toString()
  const expected = 'my-tag.container>[slot=title]{display:block}'
  t.equal(actual, expected, 'Converts ::slotted selector with arguments')
  t.end()
})

test('should convert :host-context selector with type and class arguments', t => {
  const result = transform({
    minify: true,
    code: Buffer.from(`:host-context(body.dark-theme) div { background:blue; }`),
    visitor: composeVisitors([
      shadySelectors({ scopeTo: 'my-tag' })
    ])
  })
  const actual = result.code.toString()
  const expected = 'body.dark-theme my-tag div{background:#00f}'
  t.equal(actual, expected, 'Converts :host-context selector with type and class arguments')
  t.end()
})

test('should convert :host-context selector with type and id arguments', t => {
  const result = transform({
    minify: true,
    code: Buffer.from(`:host-context(some-thing#dang) div { background:blue; }`),
    visitor: composeVisitors([
      shadySelectors({ scopeTo: 'my-tag' })
    ])
  })
  const actual = result.code.toString()
  const expected = 'some-thing#dang my-tag div{background:#00f}'
  t.equal(actual, expected, 'Converts :host-context selector with type and id arguments')
  t.end()
})
