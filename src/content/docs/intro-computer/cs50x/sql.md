---
title: "07 CS50x SQL"
---

# Structure Query Language
*结构化查询语言*
> A declarative programming language.
> CS50 uses sqLite3
## Flat-file databases
A very light weight database.
```python
import csv

with open("favourites.csv", "r") as file:
# CSV is a package that comes with Python.
	reader = csv.reader(file)
	
	next(reader) # skip the header
	
	for row in reader:
		favourite = row[1]
		print(favourite)
```
`csv` library comes with a function called `reader`, which takes as its sole argument here a file has already opened.
```python
reader = csv.DictReader(file)

next(reader)

for row in reader:
	favourite = row["language"]
	print(favourite)
```
Dictionary is a collection of key-value pairs, which means now we can use **words** as our **indices** instead of just numbers.
In general, using a dictionary reader is more ==robust==.

**Better** version of dictionary reader:
```python
reader = csv.DictReader(file)

scratch, c, python = 0, 0, 0

for row in reader:
	favourite = row["language"]
	if favourite == "Scratch":
		scratch += 1
	elif favourite == "C":
		c += 1
	elif favourite == "Python":
		python += 1

print(f"Scratch: {scratch}")
print(f"C: {c}")
print(f"Python: {python}")
```
It gives us the ==total counts== instear of every row.
```python
counts = {}

	for row in reader:
		favourite = row["language"]
		if favourite in counts:
			counts[favourite] += 1
		else:
			counts[favourite] = 1 # 第一次见，设置为1
		
for favourite in counts:
	print(favourite, counts[favourite])
```
## Rational databases
==4== fundamental operation:
~={cyan}**C**=~reate
~={cyan}**R**=~ead -> ~={cyan}**S**=~elect
~={cyan}**U**=~pdate
~={cyan}**D**=~elete

Terminal:
`$ sqlite3 favourite.db`
`sqlite> .mode csv`
`sqlite> .import favourites.csv favourites`
`...`
```SQL
CREATE TABLE table (column type, ...);
```
