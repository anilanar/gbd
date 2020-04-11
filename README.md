# 🐸 `gbd.macro`

`gbd.macro` is a [babel plugin macro](https://github.com/kentcdodds/babel-plugin-macros) that "prints and returns the value of a given expression for quick and dirty debugging". It is a shameless port of rust's `dbg!` macro.

`gbd.macro` is Typescript ready!

---

## How to use

```
npm install gbd.macro --save-dev
```

```
yarn add gbd.macro -D
```

## Examples

```typescript
import { gbd } from 'gbd.macro';

function trimAll = (strings: string[]) => strings.map(str => gbd(str.trim()));

console.log(
    "Result: ",
    trimAll([" hi ", " everyone! "]).join(' ')
);
```

```
# Prints


> str.trim()
= "hi"

> str.trim()
= "everyone"

"Result: hi everyone!
```

---

```typescript
import { gbd } from "gbd.macro";

const a = 2;
const b = gbd(a * 2) + 1;

b === 5; // true
```

```
# Prints

> a * 2
= 4
```

---

```typescript
import { gbd } from "gbd.macro";

function foo(n: number) {
  if (gbd(n / 4) === 0) {
    // Do something
  }
}

foo(3);
```

```
# Prints

> n / 4
= 0.75
```

---

```typescript
import { gbd } from 'gbd.macro';

function factorial(n: number): number {
    if gbd(n <= 1) {
        return gbd(1);
    } else {
        return gbd(n * factorial(n - 1))
    }
}

gbd(factorial(4));
```

```
# Prints

> n <= 1
= false

> n <= 1
= false

n <= 1
= false

n <= 1
= true

> 1
= 1

> n * factorial(n - 1)
= 2

> n * factorial(n - 1)
= 6

> n * factorial(n - 1)
= 24

> factorial(4)
= 24
```

---

## How it works

When you use `gbd.macro`, the following transformation happens:

```
import { gbd } from 'gbd.macro';

gbd(1 + 2);

      ↓ ↓ ↓ ↓ ↓ ↓

import { gbd } from 'gbd';

gbd(1 + 2, "1 + 2");
```

`gbd` is implemented roughly as follows:

```javascript
import format from "pretty-format";

export function gbd(val, expr) {
  console.debug(`> ${expr}\n= ${format(val)}`);
  return val;
}
```

---

## Inspiration

- A [tweet](https://twitter.com/frontsideair/status/124778767098343014) from [Fatih Altinok](https://twitter.com/frontsideair).

- [rust's dbg!](https://doc.rust-lang.org/std/macro.dbg.html).

## License

MIT
