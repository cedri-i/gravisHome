---
title: "03 CS50x Algorithms"
---

>  An algorithm is just step-by-step instructions for solving some problem.

## Linear Search
$$
\Omega(1) \&O(N)
$$
But we are not always that fortunate!
$$
\Theta(N)
$$
It is asymptotic notation. (When big O and Omega happen to be the same.) None of the algorithms ~={yellow}*thus far*=~ can be described in this way with Theta notation.
## Binary Search
$$
Time~Complexity=O(\log N)
$$

## Sorting
### Selection Sort
### Bubble Sort
### Merge Sort
Pseudo code:
`if only one number`
	`quit`
`else`
	`sort left half of numbers`
	`sort right half of numbers`
	`merge sorted halves`
Its *time complexity* :
$$
O(N\log_{2}N)~or~\Theta(N\log_{2}N)
$$
Big O and Theta are the same.