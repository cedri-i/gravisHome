---
title: "Lecture 04"
---

# Floating Point
> 浮点数是计算机系统中比较难理解的内容
> 它是计算机系统内部表示实数的方法
- 浮点数符合交换律而不符合结合律
# Fractional binary numbers
- What is $1011.101_2$ ?
- ~={yellow}**Representation**=~
	- Bits to right of "binary point" represent fractional powers of 2
	- Represents rational numbers: $\sum\limits^{i}_{k=-j}b_{k}\times2^k$
	- 与十进制完全相同，只是基数换成了2
- ~={yellow}**Observations**=~
	- Numbers of form $0.111111..._2$ are just below 1.0
		- $1/2+1/4+1/8+...+1/2^{i}+...$➡$1.0$
		- Use notation $1.0-\epsilon$
## Representable Numbers
- 我们只能表示形如$x/2^k$的有理数
- 不满足该形式的需要循环才能准确表示
- 浮点为~={orange}**移动的二进制小数点**=~，兼顾精度，也受到位数有限的制约
# Floating Point Representation
## Numerical Form:
$(-1)^{s}\cdot M\cdot2^{E}$
==*所有浮点数*==都必须以这种形式表示
- s：符号位，确定正负
- M：尾数（mantissa），通常是介于1.0和2.0的小数
- E：指数，会以2的E次幂形式扩大或缩小尾数值
## Encoding
- MAS `s` is sign bit s
- exp field encodes E (but is not equal to E)
- frac field encodes M (but is not equal to M)
### Single precision: 32 bits
$$ \begin{array}{|c|c|c|} \hline \color{#ff6b6b}{\mathtt{s}} & \color{#4ecdc4}{\mathtt{exp}} & \color{#45b7d1}{\mathtt{frac}} \\ \hline 1\ \text{bit} & 8\ \text{bits} & 23\ \text{bits} \\ \hline \end{array} $$
### Double precision: 64 bits
$$ \begin{array}{|c|c|c|} \hline \color{#ff6b6b}{\mathtt{s}} & \color{#4ecdc4}{\mathtt{exp}} & \color{#45b7d1}{\mathtt{frac}} \\ \hline 1\ \text{bit} & 11\ \text{bits} & 52\ \text{bits} \\ \hline \end{array} $$
### Extended precision: 80 bits (`Intel` only)
$$ \begin{array}{|c|c|c|} \hline \color{#ff6b6b}{\mathtt{s}} & \color{#4ecdc4}{\mathtt{exp}} & \color{#45b7d1}{\mathtt{frac}} \\ \hline 1\ \text{bit} & 15\ \text{bits} & 63~or~64 \ \text{bits} \\ \hline \end{array} $$
第三种不在讨论范围内
## ~={green}Normalized=~ Values
- **W**hen $exp\neq000...0$ and $exp\neq111...1$
	- 全0和全1的情形都是特殊类型的数字
- **E**xponent coded as a biased value: ~={yellow}**E = Exp - Bias**=~
	- Exp: ~={cyan}**unsigned**=~ value of exp field
	- Bias = $2^{k-1}-1$, where k is number of exponent bits
		- Single precision: 127 ($2^7-1$)
		- Double precision: 1023
- **S**ignificand coded with implied leading 1: $M = 1.xxx...x_2$
	- xxx...x: bits of frac field
	- Minimum when frac = ==000...0== (M = 1.0)
	- Maximum when frac = ==111...1== (M = 2.0 - $\epsilon$)
	- Get extra leading bit for "free"
		- 开头的1是~={yellow}**必然存在**=~的，所以可以省掉
### Examples
- Value: `float F = 15213.0;`
	- $15213_{10}=11101101101101_2$
		$=1.1101101101101_{2}\times2^{13}$
- Signficand
	`M     =  1.1101101101101`$_2$
	`frac  =    11011011011010000000000`$_2$
- Exponent
	`E     =  13`
	`Bias  =  127`
	`Exp   =  140`   =   10001100$_2$
	- 故在实际的存储中，偏置值为连接E和Exp的桥梁
	$$ \begin{array}{|c|c|c|} \hline \color{#ff6b6b}{\mathtt{s}} & \color{#4ecdc4}{\mathtt{exp}} & \color{#45b7d1}{\mathtt{frac}} \\ \hline \mathtt{0} & \mathtt{10001100} & \mathtt{11011011011010000000000} \\ \hline \end{array} $$
### 范围
$0\leq Exp\leq255$
$-127\leq E\leq128$
以上单纯为偏移编码的范围，==不是浮点数中exp的实际情况==
## ~={red}Denormalized=~ Values
用来表示**极接近0的小数**，填补规范化数在0附近的精度空白
极接近0时，隐含的1限制了我们
### Condition
- exp = 000...0
	- 此时E和exp就*没有关系*了
- Exponent value: ~={pink}**E = 1 - Bias**=~ (instead of E = 0 - Bias)
- Significand coded with implied leading 0: M = 0.xxx...x$_2$
	- `xxx...x`: bits of `frac`
- Cases
	- `exp = 000...0, frac = 000...0`
		- Represents zero value
		- Note distinct values: +0 and -0 (why?)
			- ==数学上==两者~={yellow}等价=~
			- ==底层存储~={orange}**不同**=~==
			- ==运算行为==有差异
	- `exp = 000...0, frac`$\neq$ `000...0`
		- Numbers closest to 0.0
		- Equispaced：所有非规范化数在数轴上是==等间距==的
### 等间距理由
表示：
$(-1)^{s}\times(0.mantissa)\times2^{1-bias}$
设单精度**最小间隔（ULP）**
$间隔 = \frac{2^{1-bias}}{2^{23}}$
对所有非规范化数：
- ==指数不变==
- 尾数每 + 1，数值 + **同一个固定间隔**
## ~={yellow}Special=~ Values
### Condition: `exp = 111...1`

- Case: `exp = 111...1, frac = 000...0`
	- Represents value $\infty$ 
	- Operation that overflows
	- Both positive and negative
	- E.g., 1.0/0.0 = -1.0/-0.0 = $+\infty$, 1.0/-0.0 = $-\infty$
- Case: `exp = 111...1, frac`$\neq$ `000 ...0`
	- Not-a-Number (NaN) （第一次知道NaN的意思）
	- Represents case when no numeric value can be determined
	- E.g., $sqrt(-1), \infty-\infty,\infty\times0$
## 图示
$$
\begin{array}{c}
\text{NaN} & & -\infty & \text{—Normalized—} & \text{—Denorm—} & \dashv \mid \vdash & \text{—Denorm—} & \text{—Normalized—} & +\infty & & \text{NaN} \\
\llcorner \mkern-5mu \text{—} \mkern-5mu \lrcorner & & \mid & \xleftarrow{\hspace{2cm}} & \xleftarrow{\hspace{1cm}} & \underset{-0 \enspace +0}{\uparrow} & \xrightarrow{\hspace{1cm}} & \xrightarrow{\hspace{2cm}} & \mid & & \llcorner \mkern-5mu \text{—} \mkern-5mu \lrcorner
\end{array}
$$
这张图很清晰
## 关于Bias
- 将带符号的指数（Exponent）映射为无符号的正整数，从而简化计算机对浮点数的比较和排序。
- 可以保证数据的单调性
# Rounding
$$
\begin{array}{l|ccccc}
\hline
\text{Mode} & \$1.40 & \$1.60 & \$1.50 & \$2.50 & -\$1.50 \\
\hline
\text{Towards zero} & \$1 & \$1 & \$1 & \$2 & -\$1 \\
\text{Round down } (-\infty) & \$1 & \$1 & \$1 & \$2 & -\$2 \\
\text{Round up } (+\infty) & \$2 & \$2 & \$2 & \$3 & -\$1 \\
\textbf{Nearest Even (default)} & \$1 & \$2 & \$2 & \$2 & -\$2 \\
\hline
\end{array}
$$
向偶数舍入可以使大批量数据的计算误差趋于0
## Rounding Binary Numbers
- Binary Fractional Numbers
	- "Even" when least significant bit is 0
	- "Half way" when bits to right of rounding position = 100...$_2$
- Examples
	- Round to nearest 1/4 (2 bits right of binary point)
$$
\begin{array}{lllll}
\hline
\text{Value} & \text{Binary} & \text{Rounded} & \text{Action} & \text{Rounded Value} \\
\hline
2 \text{ } 3/32 & 10.00\color{red}{011}_2 & 10.00_2 & (<1/2 \text{—down}) & 2 \\
2 \text{ } 3/16 & 10.00\color{red}{110}_2 & 10.01_2 & (>1/2 \text{—up}) & 2 \text{ } 1/4 \\
2 \text{ } 7/8 & 10.11\color{red}{100}_2 & 11.00_2 & ( \text{ } 1/2 \text{—up}) & 3 \\
2 \text{ } 5/8 & 10.10\color{red}{100}_2 & 10.10_2 & ( \text{ } 1/2 \text{—down}) & 2 \text{ } 1/2 \\
\hline
\end{array}
$$
- 看懂了！🙂
- 方法十分固定：~={purple}**你只需要识别中间值**=~
# FP Multiplication
$(-1)^{s1}\cdot M1\cdot 2^{E1}\times(-1)^{s2}\cdot M2\cdot2^{E2}$
Exact Result: $(-1)^{s}\cdot M\cdot2^{E}$
- Sign s: s1 ^ s2
- Significand M: M1 $\times$ M2
- Exponent E: E1 + E2
## Fixing
- If M $\geq$ 2, shift M right, increment E
- If E out of range, overflow
- Round M to fit `frac` precision
## Implementation
- Biggest chore is multiplying significands
# Floating Point in C
## C Guarantees Two Levels
- `float` — single precision
- `double` — double precision

---
## Conversions/Casting
- Casting between `int`, `float`, and `double` changes bit representation
### `double`/`float` → `int`
- Truncates fractional part
- Like rounding toward zero
- Not defined when out of range or `NaN`: Generally sets to TMin
### `int` → `double`
- Exact conversion, as long as `int` has ≤ 53 bit word size
### `int` → `float`
- Will round according to rounding mode
# Quiz
`int x == (int)(float)x`❌
`float`会对整数进行舍入，导致**高位/低位**丢失，再转回`int`就和原值不一样了
`int x == (int)(double)x`👍
`double`确有足够的位数
`float f == (float)(double)f`👍
`double d == (double)(float)d`❌
`f == -(-f)`👍
`2/3 == 2/3.0`❌
`d < 0.0 -> d * 2 < 0.0`👍
`d > f -> -f > -d`👍
`d * d >= 0.0`👍
`(d + f) - f == d`❌

> 浮点数不是真实的值，但它们（运算结果）的可预测性很强