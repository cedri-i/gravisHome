---
title: "Lecture 02"
---

# Bits, Bytes, and Integers
- 只有 ENIAC 用十进制进行数学运算
- 为了表示方便，经常将 4 位合并写成十六进制
- 虚拟地址空间是由~={cyan}机器字长=~决定的
	- 64 位机器指地址是 64-bit（或 8-byte）值
## 位操作
`& | ^ ~`
## 位向量 bit vector
- Width w bit vector represents subsets of {0, ..., w-1}
- $a_j=1~if~j\in A$
	- 01101001 -> {0, 3, 5, 6}
	- 01010101 -> {0, 2, 4, 6}
- 从==右至左==进行编号
## Logic Opreations in C
区分位运算和逻辑运算
- 提前终止是其重要特性
### Shift Operations
左移往往一样，右移却有两种
#### Left Shift: `x << y`

|  Argument x   |  01100010  | 10100010   |
| :-----------: | :--------: | ---------- |
|    `<< 3`     | 00010*000* | 00010*000* |
|  Log. `>> 2`  | *00*011000 | *00*101000 |
| Arith. `>> 2` | *00*011000 | *11*101000 |
#### Right Shift: `x >> y`
1. Logic Shift: 填充 0
2. Arithmetic Shift: 填充符号位的数字
#### Undefined Behavior
- Shift amount < 0 or > word size
	- 有一些机器得到全 0
	- 另一些会将其 module 8
## Number Representations
### Encoding Integers
- Unsigned
$B2U(X)=\sum\limits^{w-1}_{i=0}x_{i}\cdot 2^{i}$
B2U 的意思是从比特位模式转化成无符号数的编码表示
- Two's Complement
$B2T(X)=-x_{w-1}\cdot2^{w-1}+\sum\limits^{w-2}_{i=0}x_{i}\cdot2^i$
>这个~={cyan}*权重*=~解释确实比“取反加 1”更容易理解，但我觉得后者还是可以作为一个技巧保留的。

符号位很重要
- 0 for nonnegtive
- 1 for negative
==补码计算加法次数更少==——*by 某弹幕*
以 9 为例：
1. $(9)_{Decimal}=(00001001)_{Bianry}$
2. 按位取反再加 1
 $00001001->11110110->11110111$
3. 计算
 $-1\cdot2^{7}+1\cdot2^{6}+1\cdot2^{5}+1\cdot2^{4}+1\cdot2^{2}+1\cdot2^{1}+1\cdot2^{0}=-9$
由此验证的确得到其==相反数==
### 极值
以 5-bit 举例（字长）
- Two's Complement Values
	- 最小数（TMax）：10000 -> -16
	- 最大数（TMin）：01111 -> 15
	~={purple}这也解释了为什么 15 的下一个会是-16=~
	- 每一位都是 1 时，~={yellow}**总为-1**=~
- Unsigned Values
	- 最大数（UMax）：11111 -> 31
	- 最小数（UMin）：00000 -> 0
#### `C` Programming
```C
#include <limits.h>

int main() {
	const int ULONG_MAX;
	const int LONG_MAX;
	const int LONG_MIN;
}
```
#### 互相转化
##### T2U
10000：-16 -> 16
加两次最高位表示的数
##### U2T
同理
### Summary
Casting Signed <-> Unsigned: Basic Rules
- Bit pattern is ~={yellow}*maintained*=~
- But ~={yellow}*reinterpreted*=~
- Can have ~={red}unexpected effects=~: adding or substracting $2^w$
- Expression containing signed and unsigned int:
	- `int` is cast to `unsigned`!!
- `sizeof` 返回 `unsigned` 值
### 扩展
e.g.
`0110 -> 00110`
`1110 -> 11110`
原理：$-1\cdot2^3=-1\cdot2^{4}+1\cdot2^{3}$
### 缩短
#### Unsigned
类似于 module 2 的幂
`11011 -> 1011: 27 -> 11`
#### Signed
`11011 -> 1011: -5 -> -5`
`10011 -> 0011: -13 -> 3`
可以理解为：~={cyan}-13 模 16 为 3=~
