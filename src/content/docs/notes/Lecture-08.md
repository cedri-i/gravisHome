---
title: "Lecture 08"
---

# Machine-Level Programming IV: Data

讨论数据的表示
在机器级代码里是~={yellow}**没有**=~数组这一高级概念的
- 将其视为字节的集合
- C 编译器的工作就是生成适当的代码来分配该内存

# Arrays

## Array Allocation
### Basic Principle
`T A[L];`
- Array of data type *T* and length *L*
- Contiguously allocated region of *L* `* sizeof`(*T*) bytes in memory

`int val[5];`
这样做对应着两件事：
- 分配足够的存储字节来保存整个数组
- 某种程度上，可以~={cyan}像指针一样对待数组 A 的标识符=~，可以做它的指针运算
- 若 `val` 为 x，那么 `val + 1` 时，我们希望它增加足够的字节以指向下一个整数，即 `x + 4`
	- 注意~={red}不能使用=~`val++`

- 编译器并不反对使用负值作为数组下标，它会给出一个潜在的未定义值
	- `C`==没有边界检查==


```c
#define ZLEN 5
typedef int zip_dig[ZLEN];

zip_dig cmu = { 1, 5, 2, 1, 3 };
zip_dig mit = { 0, 2, 1, 3, 9 };
zip_dig ucb = { 9, 4, 7, 2, 0 };
```

Assuming `sizeof(int) == 4`:

| Array | Base address | Elements at successive addresses |
| --- | ---: | --- |
| `cmu` | 16 | `1@16`, `5@20`, `2@24`, `1@28`, `3@32` |
| `mit` | 36 | `0@36`, `2@40`, `1@44`, `3@48`, `9@52` |

Each array occupies $5 \times 4 = 20$ contiguous bytes.

- 这时 `cmu`、`mit` 同样会~={yellow}退化=~为指向其第一个元素的指针

### Array Accessing Example

```C
int get_digit
(zip_dig z, int digit)
{
	return z[digit];
}
```
汇编版本：
```IA32
# %rdi = z
$ %rsi = digit
movl (%rdi, %rsi, 4), %eax # z[digit]
```
- 寄存器 `%rdi` 为数组起始地址
- 寄存器 `%rsi` 为数组索引（下标）
- 根据公式，需要的数据在 `4 * %rsi + %rdi`
	- 在这里进行了缩放

- 把计算出的地址读取的值 copy 到 `%eax` 中
- 因为是 `int`，所以占据 `%rax` 的低四位

### Array Loop Example

```C
void zincr(zip_dig z) {
	size_t i;
	for (i = 0; i < ZLEN; i++)
		z[i]++;
}
```
汇编版本：
```IA32
# %rdi = z
movl    $0, %eax                #  i = 0
jmp     .L3                     #  goto middle
.L4:                            # loop:
addl    $1, (%rdi,%rax,4)       #  z[i]++
addq    $1, %rax                #  i++
.L3:                            # middle
cmpq    $4, %rax                #  i:4
jbe     .L4                     #  if <=, goto loop
rep; ret
```
## One-dimensional (以上)

## Multidimensional (Nested) Arrays

### 本质：~={cyan}**数组的数组**=~

内存布局：~={yellow}***行优先顺序*** =~(Row-Major Ordering)
- **含义：** ~={green}内存会先完整地存完第 0 行的所有元素=~，接着存第 1 行的所有元素，以此类推。
- **连续性：** 整个数组在内存中是~={yellow}**一整块连续**=~的空间，行与行之间没有间隙。
### Array Size 总大小

$$Total\_Size = R \times C \times K$$

### Address Calculation 元素地址定位

$$Address(A[i][j]) = Base\_Address + (i \times C + j) \times K$$
- 先跳过前 $j$ 行
- 再在本行内锁定目标元素

### `a[i]`

对于 `int a[R][C]`：
- `a[i]` 代表第 $i$ 行完整的“子数组”

不同语境下：
1. ~={cyan}数组名=~
	- `sizeof(a[i])` 的值是 `C * sizeof(int)`
2. 作为~={cyan}地址=~
	- `a[i]` 退化为指向第 $i$ 行第一个元素 `&a[i][0]` 的指针
	- 其类型是 `int *`
3. 在内存地址计算中
	- $$\text{Address of } a[i] = \text{Base Address} + (i \times \text{一行的总字节数})$$
	- 这体现了 `a[i]` 是指向~={purple}**某一行起始位置**=~的标识符

### 启发

- 了解“行优先”对编写高性能代码至关重要
- 按行遍历数组比按列遍历快得多
	- 前者符合~={cyan}**空间局部性**（Spatial Locality）=~
	- 能更好地利用 CPU 缓存

### Element Access in Multi-Level Array

```C
int get_univ_digit
(size_t index, size_t digit)
{
	return univ[index][digit];
}
```
汇编版本：
```Assembly
salq    $2, %rsi              # 4 * digit
addq    univ(, %rdi, 8), %rsi # p = univ[index] + 4 * digit
movl    (%rsi), %eax          # return *p
ret
```

### Array Element Accesses

#### 1. Nested Array
```C
#include <stdio.h>

// 嵌套数组：所有数据紧挨在一起
// 内存布局：[1, 5, 2, 0, 6, 1, 5, 2, 1, 3, ...]
int pgh[3][5] = {
    {1, 5, 2, 0, 6},
    {1, 5, 2, 1, 3},
    {1, 5, 2, 2, 1}
};

int get_pgh_digit(size_t index, size_t digit) {
    // 汇编底层直接计算：pgh + (index * 5 + digit) * 4
    // 只需要 1 次内存访问
    return pgh[index][digit];
}
```

- 这种方式在内存中是一块**连续的、矩形的**区域，~={cyan}编译器在编译阶段就必须知道每行有多少列=~，以便计算偏移量
#### 2. Multi-level Array
```C
#include <stdio.h>

// 每一行都是独立分配的一维数组
int row0[5] = {1, 5, 2, 0, 6};
int row1[5] = {1, 5, 2, 1, 3};
int row2[5] = {1, 5, 2, 2, 1};

// univ 是一个指针数组，存放的是上面三个数组的地址
// 内存布局：univ 存了 [row0的地址, row1的地址, row2的地址]
int *univ[3] = {row0, row1, row2};

int get_univ_digit(size_t index, size_t digit) {
    // 汇编底层分两步：
    // 1. 先从 univ[index] 取出那一行首地址 p
    // 2. 再从 p[digit] 取出具体的整数
    // 需要 2 次内存访问
    return univ[index][digit];
}
```

- 每个指针指向独立的一维数组
- 每一行的长度可以不同
- 且物理位置不连续
	- 确切地说，是“**可以**”不连续，且在实际应用中“**通常**”不连续
## Understanding Pointers & Arrays

| C declaration | Meaning | Memory layout on x86-64 | `sizeof` |
| --- | --- | --- | ---: |
| `int A1[3]` | array | three contiguous `int` objects | 12 bytes |
| `int *A2` | pointer | one address that may point to an `int` | 8 bytes |
| `int *A2[3]` | array of pointers | three contiguous pointer objects | 24 bytes |
| `int (*A3)[3]` | pointer to array | one address pointing to an array of three `int` objects | 8 bytes |

> Arrays are sized by their complete contents; pointers have the fixed pointer size of the target architecture.

- 在 `C` 语言中，`[]` 的优先级比 `*` 高
- 若没有括号：`int *A2[3]`，`A2` 先和 `[3]` 结合，它是数组，里面存的是 `int*`
- 有括号： `int (*A3)[3]`，`A3` 先和 `*` 结合，这强制说明 `A3` 本质上是一个指针
	- 跳出括号看，剩下的部分是 `int [3]`，故它是一个指向“**拥有 3 个整数的数组**”的指针

# Structures

## Structure Representation

```C
struct rec {
	int a[4];
	size_t i;
	struct rec *next;
};
```

For the version with `size_t i`, the 32-byte object is laid out as:

| Byte offsets | Size | Field |
| --- | ---: | --- |
| 0–15 | 16 bytes | `a[4]` |
| 16–23 | 8 bytes | `i` |
| 24–31 | 8 bytes | `next` |

- Structure represented as block memory
	- Big enough to hold all of the ~={yellow}**fields**=~

## Followed Linked-list

```C
struct rec {
    int a[4];       // 偏移 0-11 (由于对齐，12-15 为空)
    int i;         // 偏移 16
    struct rec *next; // 偏移 24
};

void set_val(struct rec *r, int val) {
    while (r) {
        int i = r->i;      // 对应 movslq 16(%rdi)
        r->a[i] = val;     // 对应 movl %esi, (%rdi,%rax,4)
        r = r->next;       // 对应 movq 24(%rdi)
    }
}
```
x86-64 汇编实现
```Assembly
.L11:
    movslq 16(%rdi), %rax         # 从 r+16 处读取 i (并符号扩展为 64 位)
    movl   %esi, (%rdi, %rax, 4)  # 写入 val 到地址: r + 0 + (i * 4)
    movq   24(%rdi), %rdi         # 从 r+24 处读取下一个节点的指针并更新 r
    testq  %rdi, %rdi             # 检查 r 是否为 NULL (0)
    jne    .L11                   # 如果不为 0，跳转回循环起始点
```


For the later version with `int i`, alignment inserts four bytes before the pointer:

| Byte offsets | Size | Field |
| --- | ---: | --- |
| 0–15 | 16 bytes | `a[4]` |
| 16–19 | 4 bytes | `i` |
| 20–23 | 4 bytes | padding |
| 24–31 | 8 bytes | `next` |

|**指令**|**操作**|**是否改变目标值**|**常用场景**|
|---|---|---|---|
|**`testq %rax, %rax`**|`rax & rax`|**否**|检查变量是否为 0 或正负|
|**`cmpq %rbx, %rax`**|`rax - rbx`|**否**|比较两个数的大小|
|**`andq %mask, %rax`**|`rax & mask`|**是**|掩码操作，保留/清除特定位|
## Allocation
## Access
## Alignment

对齐本质上是~={yellow}**后一个数据**=~对起始地址的挑剔
- 如果你把成员按~={cyan}从大到小=~的顺序排列（先写 `double`，再写 `int`，最后写 `char`），通常能压榨出最少的 Padding 空间。
- 这就是为什么老练的程序员写结构体都很在意顺序。

```C
struct S1 {
	char c;
	int i[2];
	double v;
} *p;
```

Without alignment, the fields would be packed at offsets `0`, `1`, `5`, and `9`, causing multi-byte fields to start at unsuitable addresses.

The compiler instead produces this 24-byte layout:

| Byte offsets | Size | Contents |
| --- | ---: | --- |
| 0 | 1 byte | `c` |
| 1–3 | 3 bytes | padding for 4-byte alignment |
| 4–7 | 4 bytes | `i[0]` |
| 8–11 | 4 bytes | `i[1]` |
| 12–15 | 4 bytes | padding for 8-byte alignment |
| 16–23 | 8 bytes | `v` |

### Alignment Principles

#### Aligned Data
- Primitive data type requires K bytes
- Address must be multiple of K
- *~={cyan}Required*=~ on some machine; ~={cyan}*advised*=~ on x86-64

#### Motivation for Aligning Data
- Memory accessed by (aligned) chunks of 4 or 8 bytes (system dependent)
	- ~={yellow}**Inefficient**=~ to load or store datum that spans quad word boundaries
	- Virtual memory trickier when datum spans 2 pages

#### Compiler
- Inserts gaps in structure to ensure correct alignment of fields
For a simpler `char` followed by `int` example:

| Byte offsets | Contents |
| --- | --- |
| 0 | `char c` |
| 1–3 | compiler-inserted padding |
| 4–7 | `int i` |

The three-byte gap moves `i` to offset 4, which satisfies its alignment requirement.

# Floating Point

All XMM registers caller-saved