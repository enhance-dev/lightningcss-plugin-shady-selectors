# lightningcss-plugin-shady-selectors
Lightningcss plugin for transforming Shadow DOM selectors to Light DOM selectors
The core of this postcss plugin was developed by the amazing [Ryan Bethel](https://github.com/ryanbethel) for use with [Enhance SSR](https://github.com/enhance-dev/enhance-ssr) and was ported to a postcss plugin to enable more support for emerging CSS standards.

This transform enables scoping styles in Enhance components with or without the need for shadowDOM. 

It does not add new syntax. It sets firm upper bound so component styles can't bleed outside the component. It also allows some Web Component CSS selectors (::part, ::slotted, and :host) to target enhance components both before and after JavaScript hydrates the components. For server side rendering these selectors are converted to CSS that does not require the shadowDOM.

## Goal 
The shadowDOM gives full encapsulation of styles, but breaks other things like forms. When building with components what we want is some reasonable tools to help scope styles to those components. More like caution tape than chain-link fence. If the shadowDOM is used styles can be written once that will work before and after the shadowDOM initializes.

## limitations
This approach doesn't completely avoid deep selection of nested elements. It makes tradeoffs to improve scoping without creating other problems. Transformed shadow selectors can also select some unintended elements if they are written to too broadly (i.e. `::slotted(*)` will select all children). If you prefer a bullet proof style encapsulation and are willing to accept the downsides (broken forms, FOUC, etc.) use the shadowDOM.   

## Other Recommendations
- Use specific selectors to avoid deep selecting.
  It is better to use the `>` child selector rather than the general descendent selector when possible(i.e. `:host > div` ). 
- With slotted and part be specific enough to avoid over selection
  

## Install
`npm i @enhance/lightningcss-plugin-shady-selectors`

## Usage

```JavaScript
import { transform, composeVisitors } from 'lightningcss';
import shadySelectors from 'lightningcss-plugin-shady-selectors';

let res = transform({
  filename: 'test.css',
  minify: true,
  code: Buffer.from(`.foo { display: block; }`),
  visitor: composeVisitors([
    shadySelectors({ scopeTo: 'my-element'})
  ])
})

assert.equal(res.code.toString(), 'my-tag.foo{display: block;}')
```
> scopeTo is the element you want to scope the selector to


### Component scoping

Basic component scoping is done by adding a component selector to every rule. This effectively sets the upper bound to all rules so styles cannot leak outside the component. The rule `div {background: red}` becomes `my-tag div {background: red}`. This sets a firm upper bound on styles but it does not limit deep selecting for anything nested inside the component. This is sometimes useful and sometimes a problem. To limit deep selection you can use more specificity in your selector choice. Combining this technique with utility classes also helps limit deep selection by minimizing the number of rules that need to be written for each component. 

#### `:host` `:host()` `:host-context()` 
When writing components it is often necessary to add styles to the element itself. The `:host` selector and its variations solve this problem, but they do not work when there is no shadowDOM. For the SSR context these styles are converted so that they work for both. `:host` itself is a selector stand in for the element. The function form of `:host()` is [required](https://drafts.csswg.org/css-scoping/#host-selector:~:text=it%20takes%20a%20selector%20argument%20for%20syntactic%20reasons%20(we%20can%E2%80%99t%20say%20that%20%3Ahost.foo%20matches%20but%20.foo%20doesn%E2%80%99t)%2C%20but%20is%20otherwise%20identical%20to%20just%20using%20%3Ahost%20followed%20by%20a%20selector.) to specify a class or attribute on the host itself. In order to select the context outside of host you can use the `:host-context()` form. 

```CSS
/* Scoping without host */
div { color: red; }
/* Becomes */
my-tag div { color: red; }

/* Scoping with host selector */
:host { color: red; }
/* Becomes */
my-tag { color: red; }

:host(.some-class) div { color: red; }
/* Becomes */
my-tag.some-class div { color: red; }

:host-context(footer > h1) div { color: red; }
/* Becomes */
footer > h1 my-tag div { color: red; }

```

#### `::slotted()` 
With shadowDOM `<slot>`'s child elements in the light DOM are rendered inside the shadowDOM. The `::slotted()` pseudo selector is used inside the shadowDOM to style these elements. Any selector argument will be applied to any matching elements that are slotted. The transform takes rules like `div::slotted([slot=here]) { color:red; }` and returns `div[slot=here] { color: red; }`. This allows for styles to be written that work both with and without the shadowDOM. It also lets you write styles so the intent is clear. Use caution picking the selector argument so that it does not select more than intended after transformation. `::slotted(*)` for instance would select all elements. `::slotted([slot])` is useful for selecting all named slot contents.  
#### `::part()` 
The shadow parts API allows selected elements to be exposed for styling outside the shadowDOM. By labeling an element inside the component with a `part=something` attribute it can be selected outside that component with a `the-tag::part(something) {color: red;}` selector. For server rendering this is transformed into `the-tag [part*=something] { color: red; }`. Notice again that this does not stop deep selection. This selector will match any part of the same name nested within. 


