export default (opts = {}) => ({
  Selector(selector) {
    const scope = opts.scopeTo || ''
    let out = []

    for (let i = 0; i < selector.length; i++) {
      const s = selector[i]
      if (s?.type === 'pseudo-class' &&
        s?.kind === 'host') {
        out.unshift({ type: 'type', name: scope })
        addSelectors(s.selectors)
      }

      else if (s.type === 'pseudo-element' &&
        s.kind === 'slotted') {
        out.unshift({ type: 'type', name: scope })
        addSelectors(s.selector)
      }

      else if (s.type === 'pseudo-class' &&
        s.kind === 'custom-function' &&
        s.name === 'host-context') {
        let args = s.arguments
        for (let i = 0; i < args.length; i++) {
          const a = args[i]
          if (a.type === 'token' &&
            a.value.type === 'id-hash') {
            out.push({ type: 'id', name: a.value.value })
            out.push({ type: 'combinator', value: 'descendant' })
          }
          if (a.type === 'token' &&
            a.value.type === 'ident' &&
            args[i - 1]?.value?.type !== 'delim') {
            if (a?.value?.value) {
              out.push({ type: 'type', name: a.value.value })
            }
          }
          if (a.type === 'token' &&
            a.value.type === 'delim' &&
            a.value.value === '.') {
            const cn = i + 1
            const c = args[cn].value.value
            out.push({ type: 'class', name: c })
            out.push({ type: 'combinator', value: 'descendant' })
          }

        }
        out.push({ type: 'type', name: scope })
      }

      else {
        out.push(s)
      }

    }

    function addSelectors(selectors) {
      for (let i = 0; i < selectors?.length; i++) {
        out.push(selectors[i])
      }
    }

    return out
  }
})
