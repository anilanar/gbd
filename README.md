# 🐸 `gbd.macro`

> Prints and returns the value of a given expression for quick and dirty debugging.

This is a shameless port of rust's `dbg!` macro.

`gbd.macro` is Typescript ready!

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
import { gbd } from 'gbd.macro';

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
import { gbd } from 'gbd.macro';

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