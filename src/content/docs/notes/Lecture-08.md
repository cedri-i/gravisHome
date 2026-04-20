---
title: "Lecture 08"
---

# Machine-Level Programming IV: Data

讨论数据的表示
在机器级代码里是~={yellow}**没有**=~数组这一高级概念的
- 将其视为字节的集合
- C编译器的工作就是生成适当的代码来分配该内存

# Arrays

## Array Allocation
### Basic Principle
`T A[L];`
- Array of data type *T* and length *L*
- Contiguously allocated region of *L* `* sizeof`(*T*) bytes in memory

`int val[5];`
这样做对应着两件事：
- 分配足够的存储字节来保存整个数组
- 某种程度上，可以~={cyan}像指针一样对待数组A的标识符=~，可以做它的指针运算
- 若`val`为x，那么`val + 1`时，我们希望它增加足够的字节以指向下一个整数，即`x + 4`
	- 注意~={red}不能使用=~`val++`

- 编译器并不反对使用负值作为数组下标，它会给出一个潜在的未定义值
	- `C`==没有边界检查==


<div style="font-family: 'Source Code Pro', monospace; padding: 20px; background-color: #fff; color: #000; border: 1px solid #ddd; border-radius: 4px;">

  <h2 style="margin-top: 0; font-weight: bold; font-size: 24px;">Array Example</h2>
  
  <div style="background-color: #fffde7; border: 1px solid #ffe082; padding: 10px; margin-bottom: 30px; line-height: 1.4;">
    <span style="color: #008000;">#define ZLEN 5</span><br>
    typedef int zip_dig[ZLEN];<br><br>
    zip_dig cmu = { 1, 5, 2, 1, 3 };<br>
    zip_dig mit = { 0, 2, 1, 3, 9 };<br>
    zip_dig ucb = { 9, 4, 7, 2, 0 };
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 40px;">
    <div style="width: 150px; font-weight: bold;">zip_dig cmu;</div>
    <div style="display: flex; border: 2px solid black; background-color: #e0e0e0;">
      <div style="width: 60px; height: 35px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">1<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">16</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">5<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">20</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">2<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">24</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">1<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">28</span></div>
      <div style="width: 60px; display: flex; align-items: center; justify-content: center; position: relative;">3<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">32</span><span style="position: absolute; bottom: -25px; right: -2px; font-size: 13px;">36</span></div>
    </div>
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 40px;">
    <div style="width: 150px; font-weight: bold;">zip_dig mit;</div>
    <div style="display: flex; border: 2px solid black; background-color: #e0e0e0;">
      <div style="width: 60px; height: 35px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">0<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">36</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">2<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">40</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">1<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">44</span></div>
      <div style="width: 60px; border-right: 1px solid black; display: flex; align-items: center; justify-content: center; position: relative;">3<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">48</span></div>
      <div style="width: 60px; display: flex; align-items: center; justify-content: center; position: relative;">9<span style="position: absolute; bottom: -25px; left: -2px; font-size: 13px;">52</span><span style="position: absolute; bottom: -25px; right: -2px; font-size: 13px;">56</span></div>
    </div>
  </div>

</div>

- 这时`cmu`、`mit`同样会~={yellow}退化=~为指向其第一个元素的指针

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
- 寄存器`%rdi`为数组起始地址
- 寄存器`%rsi`为数组索引（下标）
- 根据公式，需要的数据在`4 * %rsi + %rdi`
	- 在这里进行了缩放

- 把计算出的地址读取的值copy到`%eax`中
- 因为是`int`，所以占据`%rax`的低四位

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
- 先跳过前$j$行
- 再在本行内锁定目标元素

### `a[i]`

对于`int a[R][C]`：
- `a[i]`代表第$i$行完整的“子数组”

不同语境下：
1. ~={cyan}数组名=~
	- `sizeof(a[i])`的值是`C * sizeof(int)`
2. 作为~={cyan}地址=~
	- `a[i]`退化为指向第$i$行第一个元素`&a[i][0]`的指针
	- 其类型是`int *`
3. 在内存地址计算中
	- $$\text{Address of } a[i] = \text{Base Address} + (i \times \text{一行的总字节数})$$
	- 这体现了`a[i]`是指向~={purple}**某一行起始位置**=~的标识符

### 启发

- 了解“行优先”对编写高性能代码至关重要
- 按行遍历数组比按列遍历快得多
	- 前者符合~={cyan}**空间局部性**（Spatial Locality）=~
	- 能更好地利用CPU缓存

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

<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 20px auto; max-width: 1000px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 1px solid #000000;">
  <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; text-align: left; table-layout: auto;">
    <thead>
      <tr style="background: #000000; color: #ffffff;">
        <th style="padding: 18px 15px; border-bottom: 2px solid #334155; font-size: 1.1em; width: 25%;">C 语言声明</th>
        <th style="padding: 18px 15px; border-bottom: 2px solid #334155; font-size: 1.1em; width: 15%;">本质</th>
        <th style="padding: 18px 15px; border-bottom: 2px solid #334155; font-size: 1.1em;">内存布局简述 (64位环境)</th>
        <th style="padding: 18px 15px; border-bottom: 2px solid #334155; font-size: 1.1em; width: 15%;">sizeof</th>
      </tr>
    </thead>
    <tbody style="color: #000000; font-weight: 500;">
      <tr style="background-color: #f8fafc;">
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <code style="font-family: 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace; background: #e2e8f0; color: #000000; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 1.05em; white-space: nowrap;">int A1[3]</code>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <span style="background: #064e3b; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 700;">数组</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; line-height: 1.5;">直接分配 3 个连续 <b style="color:#dc2626;">int</b>。变量名 A1 代表这块内存的起始位置。</td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; font-family: monospace; font-weight: 900; font-size: 1.2em;">12 字节</td>
      </tr>
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <code style="font-family: 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace; background: #e2e8f0; color: #000000; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 1.05em; white-space: nowrap;">int *A2</code>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <span style="background: #78350f; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 700;">指针</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; line-height: 1.5;">分配 8 字节存储一个地址。该地址可以指向内存中某个 <b style="color:#dc2626;">int</b>。</td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; font-family: monospace; font-weight: 900; font-size: 1.2em;">8 字节</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <code style="font-family: 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace; background: #e2e8f0; color: #000000; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 1.05em; white-space: nowrap;">int *A2[3]</code>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <span style="background: #064e3b; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 700;">指针数组</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; line-height: 1.5;">连续分配 3 个 <b style="color:#2563eb;">指针</b> 空间（3×8字节）。每个槽位存一个地址。</td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; font-family: monospace; font-weight: 900; font-size: 1.2em;">24 字节</td>
      </tr>
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <code style="font-family: 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace; background: #e2e8f0; color: #000000; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 1.05em; white-space: nowrap;">int (*A3)[3]</code>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000;">
            <span style="background: #78350f; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 700;">数组指针</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; line-height: 1.5;">分配 8 字节存储一个地址。该地址指向一个 <b style="color:#4f46e5;">包含3个int的整体数组</b>。</td>
        <td style="padding: 15px; border-bottom: 1px solid #000000; font-family: monospace; font-weight: 900; font-size: 1.2em;">8 字节</td>
      </tr>
    </tbody>
  </table>
  <div style="padding: 12px; background-color: #000000; font-size: 0.85em; color: #cbd5e1; text-align: center;">
    核心结论：本质为“数组”时看整体容量；本质为“指针”时固定为 8 字节（64-bit）。文字已最大化加深。
  </div>
</div>

- 在`C`语言中，`[]`的优先级比`*`高
- 若没有括号：`int *A2[3]`，`A2`先和`[3]`结合，它是数组，里面存的是`int*`
- 有括号： `int (*A3)[3]`，`A3`先和`*`结合，这强制说明`A3`本质上是一个指针
	- 跳出括号看，剩下的部分是`int [3]`，故它是一个指向“**拥有3个整数的数组**”的指针

# Structures

## Structure Representation

```C
struct rec {
	int a[4];
	size_t i;
	struct rec *next;
};
```

<div style="font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Courier, monospace; background-color: #ffffff; padding: 40px; border-radius: 8px; width: fit-content; margin: auto;">
    
    <div style="margin-left: 0px; color: #000000; font-weight: 900; font-size: 22px; line-height: 1.1; margin-bottom: 4px;">
        r<br>↓
    </div>

    <div style="display: flex; height: 70px; border: 4px solid #000000; background: #ffffff; box-sizing: border-box; min-width: 600px;">
        
        <div style="flex: 16; background: #dbeafe; border-right: 4px solid #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 28px; color: #000000;">
            a
        </div>

        <div style="flex: 8; background: #ffe4e6; border-right: 4px solid #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 28px; color: #000000;">
            i
        </div>

        <div style="flex: 8; background: #dcfce7; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 28px; color: #000000;">
            next
        </div>

    </div>

    <div style="display: flex; margin-top: 12px; font-weight: 900; font-size: 20px; color: #000000; letter-spacing: -0.5px;">
        <div style="flex: 16; display: flex; justify-content: space-between;">
            <span>0</span>
            <span style="margin-right: -10px;">16</span>
        </div>
        <div style="flex: 8; text-align: right; padding-right: 0px;">
            24
        </div>
        <div style="flex: 8; text-align: right;">
            32
        </div>
    </div>

</div>

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
x86-64汇编实现
```Assembly
.L11:
    movslq 16(%rdi), %rax         # 从 r+16 处读取 i (并符号扩展为 64 位)
    movl   %esi, (%rdi, %rax, 4)  # 写入 val 到地址: r + 0 + (i * 4)
    movq   24(%rdi), %rdi         # 从 r+24 处读取下一个节点的指针并更新 r
    testq  %rdi, %rdi             # 检查 r 是否为 NULL (0)
    jne    .L11                   # 如果不为 0，跳转回循环起始点
```


<div style="font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; background-color: #ffffff; padding: 40px; width: fit-content; margin: auto;">
    
    <div style="margin-left: 0px; color: #000000; font-weight: 900; font-size: 22px; line-height: 1.1; margin-bottom: 4px;">
        r<br>↓
    </div>

    <div style="display: flex; height: 70px; border: 4px solid #000000; background: #ffffff; box-sizing: border-box; min-width: 640px;">
        
        <div style="flex: 16; background: #dbeafe; border-right: 4px solid #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 26px; color: #000000;">
            a[0-3]
        </div>

        <div style="flex: 8; background: #ffe4e6; border-right: 4px solid #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 26px; color: #000000;">
            i
        </div>

        <div style="flex: 8; background: #dcfce7; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 26px; color: #000000;">
            next
        </div>

    </div>

    <div style="display: flex; margin-top: 12px; font-weight: 900; font-size: 20px; color: #000000;">
        <div style="flex: 16; display: flex; justify-content: space-between;">
            <span>0</span>
            <span style="margin-right: -10px;">16</span>
        </div>
        <div style="flex: 8; text-align: right;">
            24
        </div>
        <div style="flex: 8; text-align: right;">
            32
        </div>
    </div>

</div>




|**指令**|**操作**|**是否改变目标值**|**常用场景**|
|---|---|---|---|
|**`testq %rax, %rax`**|`rax & rax`|**否**|检查变量是否为 0 或正负|
|**`cmpq %rbx, %rax`**|`rax - rbx`|**否**|比较两个数的大小|
|**`andq %mask, %rax`**|`rax & mask`|**是**|掩码操作，保留/清除特定位|
## Allocation
## Access
## Alignment

对齐本质上是~={yellow}**后一个数据**=~对起始地址的挑剔
- 如果你把成员按~={cyan}从大到小=~的顺序排列（先写 `double`，再写 `int`，最后写 `char`），通常能压榨出最少的Padding空间。
- 这就是为什么老练的程序员写结构体都很在意顺序。

```C
struct S1 {
	char c;
	int i[2];
	double v;
} *p;
```

<div style="background-color: #ffffff; padding: 20px; color: #000000; font-family: 'JetBrains Mono', 'Courier New', monospace; width: fit-content; border: 1px solid #000000;">
    <div style="font-weight: bold; margin-bottom: 10px;">[ Unaligned Data ]</div>
    
    <div style="display: block; border: 4px solid #000000; height: 50px; white-space: nowrap; overflow: hidden;">
        <div style="display: inline-block; width: 30px;  height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; font-weight: bold;">c</div><div style="display: inline-block; width: 120px; height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; font-weight: bold;">i[0]</div><div style="display: inline-block; width: 120px; height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; font-weight: bold;">i[1]</div><div style="display: inline-block; width: 240px; height: 50px; line-height: 50px; text-align: center; font-weight: bold;">v</div>
    </div>

    <div style="position: relative; height: 20px; margin-top: 5px; font-weight: bold; font-size: 14px;">
        <div style="position: absolute; left: 0px;">p</div>
        <div style="position: absolute; left: 30px;">p+1</div>
        <div style="position: absolute; left: 150px;">p+5</div>
        <div style="position: absolute; left: 270px;">p+9</div>
        <div style="position: absolute; left: 510px; transform: translateX(-100%);">p+17</div>
    </div>
</div>

<div style="background-color: #ffffff; padding: 20px; color: #000000; font-family: 'JetBrains Mono', 'Courier New', monospace; width: fit-content; border: 1px solid #000000;">
    <div style="font-weight: bold; margin-bottom: 10px;">[ Aligned Data ]</div>
    
    <div style="display: block; border: 4px solid #000000; height: 50px; white-space: nowrap; overflow: hidden;">
        <div style="display: inline-block; width: 20px;  height: 50px; line-height: 50px; text-align: center; border-right: 1px solid #000000; box-sizing: border-box; font-weight: bold;">c</div><div style="display: inline-block; width: 60px;  height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; background: #eeeeee; font-size: 12px;">pad</div><div style="display: inline-block; width: 80px;  height: 50px; line-height: 50px; text-align: center; border-right: 1px solid #000000; box-sizing: border-box; font-weight: bold;">i[0]</div><div style="display: inline-block; width: 80px;  height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; font-weight: bold;">i[1]</div><div style="display: inline-block; width: 80px;  height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; background: #eeeeee; font-size: 12px;">pad</div><div style="display: inline-block; width: 160px; height: 50px; line-height: 50px; text-align: center; font-weight: bold;">v</div>
    </div>

    <div style="position: relative; height: 20px; margin-top: 5px; font-weight: bold; font-size: 14px;">
        <div style="position: absolute; left: 0px;">p+0</div>
        <div style="position: absolute; left: 80px;">p+4</div>
        <div style="position: absolute; left: 160px;">p+8</div>
        <div style="position: absolute; left: 320px;">p+16</div>
        <div style="position: absolute; left: 480px; transform: translateX(-100%);">p+24</div>
    </div>
</div>

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
<div style="background-color: #ffffff; padding: 20px; color: #000000; font-family: 'JetBrains Mono', monospace; width: fit-content; border: 2px solid #000000;">
    <div style="font-weight: bold; margin-bottom: 10px;">[ 编译器插入 Gap 的过程 ]</div>
    
    <div style="display: block; border: 4px solid #000000; height: 50px; white-space: nowrap;">
        <div style="display: inline-block; width: 40px; height: 50px; line-height: 50px; text-align: center; border-right: 1px solid #000000; box-sizing: border-box; font-weight: bold;">c</div><div style="display: inline-block; width: 120px; height: 50px; line-height: 50px; text-align: center; border-right: 4px solid #000000; box-sizing: border-box; background: #eeeeee; font-size: 12px; color: #666;">gap (3 bytes)</div><div style="display: inline-block; width: 160px; height: 50px; line-height: 50px; text-align: center; font-weight: bold;">int i</div>
    </div>

    <div style="position: relative; height: 20px; margin-top: 5px; font-weight: bold; font-size: 14px;">
        <div style="position: absolute; left: 0px;">0</div>
        <div style="position: absolute; left: 40px; color: #999;">1</div>
        <div style="position: absolute; left: 160px;">4 (对齐点)</div>
        <div style="position: absolute; left: 320px;">8</div>
    </div>
</div>

# Floating Point

All XMM registers caller-saved