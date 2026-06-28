---
title: "04 CS50x Memory"
---

## Hexadecimal
white: ffffff
Or equivalently, 255 ~={red}red=~, 255 ~={green}green=~, 255 ~={cyan}blue=~.
 If you just at a glance were to look at this board, and see this address: 10.
 Is that byte ==ten== or is that byte ==sixteen==?
 It could potentially be ambiguous. So in the world of hexadecimal, it's super common to literally ==prefix== any number you ever write in hexadeciaml notation, using ~={yellow}**0x**=~.
## Copying and Malloc
```c
#include <cs50.h>
#include <stdlib.h>
#include <stdio.h>
#include <...>

int main(void)
{
	char *s = get_string("s: ");
	char *r = s; // That is invalid.
	char *t = malloc(strlen(s) + 1);
	// Cuz we know that we need one more character to store the null terminator. 
	/* for (int i = 0; i < strlen(s); i++)
	{
	t[i] = s[i];
	} */
	// printf
	strcpy(t, s);
	free(t);
}
```
## Valgrind
> Valgrind is an ==**instrumentation framework**== for building dynamic analysis tools that can detect memory management and threading bugs or profile your programs in great detail.
## Garbage Values
> A **Garbage Value** refers to the unpredictable, ==leftover data== stored in a memory location that has been allocated but not yet initialized.

## Swapping
`int swap(int a, int b)`
`{`
	`int temp = a;`
	`a = b;`
	`b = temp;`
`}`
That does **NOT** work!
## File I/O
#### 1st
`FILE *file = fopen("phonebook.csv", "w");`

`char *name = get_string("Name: ");`
`char *number = get_string("Number: ");`

`fprinf(file, "%s,%s\n", name, number);`

`fclose(file);`
#### 2nd
`FILE *src = fopen(argv[1], "rb");`
`FILE *dst = fopen(argv[2], "wb");`

`BYTE b;`

`while (fread(&b, sizeof(b), 1, src) != 0)`
`{`
	`fwrite(&b, sizeof(b), 1, dst);`
`}`
