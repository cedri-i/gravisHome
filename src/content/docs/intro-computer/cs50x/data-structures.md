---
title: "05 CS50x Data Structures"
---

> Our last week on C.

## Stack and Queue
## Dictionary
| Key | Value |
| :-: | ----- |
## Resizing Arrays
```c  
#include <stdio.c>
#include <stdlib.c>

int main()
{
	int *list = malloc(sizeof(int) * 3);
	if (list == NULL)
	{
		return 1;
	}
	
	*list = 1;
	*(list + 1) = 2;
	*(list + 2) = 3;
	//But this way is ridiculous. No experienced programmer will do this.
	
	// Time passes
	int *tmp = malloc(sizeof(int) * 4);
	if (tmp == NULL)
	{
		free(list);
		return 1;
	}
	
	for (int i = 0; i < 3; i++)
	{
		tmp[i] = list[i];
	}
	
	tmp[3] = 4;
	// Free original list
	free(list);
	
	list = tmp;
	for (int i = 0; i < 4; i++)
	{
		printf("%i\n", list[i]);
	}
	
	free(list);
	
	return 0;
}
```
## Linked List
```
struct
->
```
## Trees
🎄🌳🌲🌴🎋
### Binary Search Trees
```c
typedef struct node
{
	int number;
	struct node *left;
	struct node *right;
} node;
```
Algorithms:
```c
bool search(node *tree, int number)
{
	if (tree = NULL)
	{
		return false;
	}
	else if (number < tree->number)
	{
		return search(tree->left, number);
	}
	else if (number > tree->number)
	{
		return search(tree->right, number);
	}
	else
	{
		return true;
	}
}
```
## Hashing and Hash Tables
> Hashing formally takes an infinite domain of values and maps it to a finite range of values.
```c
#include <ctype.h>

int hash(char *name)
{
	return toupper(name[0]) - 'A';
}
```
### Hash Tables
> Powerfully associate keys with values.
```c
typedef struct
{
	char *name;
	char *number;
} preson;
```
## Tries
