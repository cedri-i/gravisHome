---
title: "Lecture 03"
---

# Bits, Bytes, and Integers
第二次课
- 当然还有其他办法来表示有符号数，但补码表示法是==最常见的==
## Integers
> Java（以及其他一些语言）的发明者认为，`unsigned`的存在~={cyan}*毫无必要*=~，于是只保留了Complements。他们唯一的改变是引入`>>>`用以表示逻辑右移，而用`>>`表示算术右移。
> ~={yellow}***少用`unsigned`！***=~
### Addition, negation, multiplication, shifting
Arithmetic operations and Properties
#### Addition
##### Unsigned Addition
- Standard Addition Function
	- Ignores carry output
- Implements Modular Arithmetic
	$s=UAdd_{w}(u,v)=(u+v)~mod~2^w$
以4-bit为例：
`1101 + 0101 = 10010 -> 13 + 5 = 18`
但我们不得不截断它（~={yellow}**放弃最高位**=~），并说结果是`2`
`2 = 18 mod 16`
##### Two's Complement Addition
两个补码的加法看起来就像==普通的加法==
$(a+b)mod~m=(a~mod~m+b~mod~m)mod~m$
- TAdd and UAdd have Identical Bit-Level Behavior
```C
int s, t, u, v;
s = (int)((unsigned)u + (unsigned)v);
t = u + v;
```
Will give:
`s == t;`
同样选取上面的例子：
`1101 + 0101 = 10010 -> -3 + 5 = 2`
可见，补码的优势在于==可以统一用加法表示加减法==
- 注意正、负溢出
#### Multiplication
理论上需要~={orange}$2w$=~位表示两个$w$位相乘
##### Unsigned Multiplication in C
$UMult_{w}(u,v)=u\cdot v~mod~2^w$
##### Signed Multiplication in C
- Ignores high order $w$ bits
- Some of which are ~={orange}different=~ for signed vs. unsigned multiplication
- Lower bits are the same
##### Power-of-2 Multiply with Shift
Operation:
- `u << k` gives `u *` $2^k$
- ==Both== signed and unsigned
Operands: $w$ bits
## Representations in memory, pointers, strings
内存中数字的底层表示
### Byte Oriented Memory Organization
10位二进制数字与3位十进制数字大致相等
### Machine Words
当我使用GCC编译，我可以制定它是32位还是64位
可见，硬件和编译器一起决定字长
### Byte Ordering
big-endian and little endian
e.g.
- Variable x has 4-byte value of 0x01234567
- Address given by &x is 0x100
**大端序(Big Endian)** $$ \begin{array}{|c|c|c|c|c|c|c|c|} \hline & & \texttt{0x100} & \texttt{0x101} & \texttt{0x102} & \texttt{0x103} & & \\ \hline & & \texttt{01} & \texttt{23} & \texttt{45} & \texttt{67} & & \\ \hline \end{array} $$
符号位在首位

**小端序(Little Endian)** $$ \begin{array}{|c|c|c|c|c|c|c|c|} \hline & & \texttt{0x100} & \texttt{0x101} & \texttt{0x102} & \texttt{0x103} & & \\ \hline & & \texttt{67} & \texttt{45} & \texttt{23} & \texttt{01} & & \\ \hline \end{array} $$
看上去更奇怪一些

### Integer `C` Puzzles
`x < 0 -> x * 2 < 0`  ❌
`ux >= 0` 👍
`x & 7 == 7 -> x << 30 < 0` 👍
`ux > -1` ❌ `-1`会被隐式转换为`UINT_MAX`，故永远不成立
`x > y -> -x < -y` ❌
`x * x >= 0` ❌
`x > 0 && y > 0 -> x + y > 0` ❌
`x >= 0 -> -x <= 0` 👍
`x <= 0 -> -x >= 0` ❌
为什么反过来不行？
——因为~={cyan}**所有的正数**都**能**表示为负数，却**有一个负数不能**表示为正数=~
`(x | -x) >> 31 == -1` ❌
对于任意整数 `x`，`x | -x` 的结果是：
**将 `x` 从最高位的 1 开始到最低位全部置为 1**

