---
title: "02 CS50x Arrays"
---

> It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.

## Debugging
- **Syntax** error
- **Logical** error
- "**printf**" is going to be my friend.
- **Garbage value**: it tends to be a ==default value== inside of a variable. That's the result of that memory having been used previously for something else.🚯
## Compiling
==source== code➡==machine== code
## String
``int n = 0;
`while (s[n] != '\0')
`{`
	`n++;`
`}
We can use the `strlen()` function.
`for (int i = 0 ; i < strlen(s) ; i++){}`
It can be ~={yellow}**optimized**=~.
`int n = strlen(s);`
`for (int i = 0 ; i < n ; i++){}`
But nowadays compilers are ~={cyan}smart=~ enough. They can fix it automatically. So it's like a white lie.
## Command Line Arguments
## Cryptography

