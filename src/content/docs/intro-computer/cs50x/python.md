---
title: "06 CS50x Python"
---

> Turn to the doc and learn to teach myself!
## Speller
```python
words = set()


def check(word):
	return word.lower() in words
	
	
def load(dictionary):
	with open(dictionary) as file:
		words.update(file.read().splitlines())
	return True


def size():
	return len(words)
	
	
def unload():
	return True
```
## Filter
```python
from PIL import Image, ImageFilter

before = Image.open("bridge.bmp")
after = before.filter(ImageFilter.FIND_EDGES)
after.save("out.bmp")
```
## Functions
```python
from cs50 import get_string

answer = get_string("What's your name? ")
print("helo, " + answer)
```
`print` in Python can take ==more than one== argument.
Humans over time just realized that it's a lot easier to do this in this way than bother with *placeholders*.
```c
#include <cs50.h>
#include <stdio.h>

int main()
{
	string answer = get_string("What's your name? ");
	printf("Hello, %s\n", answer);
	
	return 0;
}
```
Another version:
```python
answer = get_string("What's your name? ")
print(f"Hello, {answer}")
```
Similar in spirit to the `%s` in C, but a little more explicit. 
***
- I can override the default behavior of the Python print function by changing the value of its ~={yellow}end parameter=~. (The default one is '`\n`'.)
```python
print("hello, world", end="")
print(*objects, sep=' ', end='\n', file=None, flush=False)
```
`''` and `""` are the same in Python. But stylistically you should really pick one and go with it.
***
- Python doesn't support `i++`.
***
## Data Types
`bool int float str`
```python
x = input("x: ")
y = input("y: ")
print(x + y)
```
`x` and `y` will be treated as strings.
```python
x = input("x: ")
y = input("y: ")
print(int(x) + int(y))
```
Or `x = int(input("x: "))`
```python
if x < y:
	print("x is less than y")
elif x > y:
	print("x is greater than y")
else:
	print("x is equal to y")
```
Python does not use curly braces, but requires that you ~={cyan}**indent**=~(缩进) your code properly.
### `str`
### `list`
```python
s = input("Do you agree? ")

if s.lower() in ["y", "yes"]:
	print("Agreed.")
else:
	print("Not agreed.")
```
Indeed, when we're dealing with strings, it's pretty reasonable to want to sometimes ==*uppercase*== them or ==*lowercase*== them, ==*capitalize*== them, or do any number of other things.
```python
s = input("s: ")

t = s.capitalize()

print(f"s: {s}")
print(f"t: {t}")
```
To uppercase every letter:
```python
s = input("Before: ")

print("After: ", end=" ")

for c in s:
	print(c.upper(), end=" ")
print() # print nothing but a new line
```
Simpler version:
```python
before = get_string("Before: ")
after = before.upper()
print(f"After: {after}")
```
## Meow🐱
```python
i = 0
while i < 3:
	print("meow")
	i += 1 #no i++
```
However, we can do this more pythonically:
```python
for i in [0, 1, 2]: # a Python list of integers
	print("meow")
```
For bigger numbers:
```python
for i in range(3):
	print("meow")
```
### def
```python
def main():
	for i in range(3):
		meow(3)
	
def meow():
	print("meow")

if __name__ == "__main__":
	main()
```
==Wrap== my function in a function `main`.
## Truncation
*截断*
```python
x = input("x: ")
y = input("y: ")

z = x / y
print(f"{z:.50}")
```
This leads to overflow.
## Exceptions
> A convenient function of Python.
```python
n = input("Input: ")
if n.isnumeric():
	print("Integer")
else:
	print("Not Integer")
```
And wouldn't it be nice if I could somehow catch this ValueError and just deal with it if it happens?
```python
try:
	n = int(input("Integer: "))
	print("Integer")
except ValueError:
	print("Not Integer")
```
## Lists
You can ask lists how long they are.
```python
scores = []
for i in range(3):
	score = int(input("Score: "))
	scores.append(score)

average = sum(scores) / len(scores)
print(f"Average: {average})
```
## Dict
```python
names = ["Kelly", "David", "John"]

name = input("Name: ")

for n in names:
	if name == n:
		print("Found")
		break
else:
	print("Not Found") # So weird
```
Easier version:
```python
if name in names:
	print("Found")
else:
	print("Not Found") # So cool
```
def dict:
```python
people = {
	"Kelly": "+1-617-495-1000",
	"David": "+1-617-495-1000",
	"John": "+1-949-468-2750"
}

name = input("Name: ")
if name in people:
	number = people[name]
	print(f"Found: {number}") # incredibly powerful
else:
	print("Not Found")
```
## Sys
```python
from sys import argv

if len(argv) == 2:
	name = argv[1]
	print(f"hello, {name}")
else:
	print("hello, world")
```
