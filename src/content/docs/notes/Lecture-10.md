---
title: "Lecture 10"
---

# Program Optimization
优化程序性能

# Overview

- 过去想要程序高性能运行必须写汇编代码
	- 现在**时代变了**

编译器：`gcc`

- 编译器有一整套编译策略，以及如何使用这些优化方案的方法

## Limitations of Optimizing Compilers

- 不能改变程序行为
	- 第一准则是“对”而非“快”

- 程序员意图被模糊
	- 定义一个`int`，编译器必须考虑到$2^{31}-1$，但其实它可能不会超过$100$

- 分析范围的限制~={cyan}（过程内分析）=~
	- 现在的GCC可以在一个文件内做交叉函数分析，但很难跨越不同的源代码文件去理解全局
	- Whole-program analysis技术上可行，但编译时间会变得极其漫长，内存消耗巨大

- Based on `static` information，难以预测运行时


# Generally Useful Optimizations

#### Optimizations that you or the compiler ~={cyan}should do regardless of processor / compiler=~

## Code Motion
- Reduce frequency with computation performed
	- If it will always produce same result
	- Especially ~={yellow}*moving code out of loop*=~


## Reduction in Strength

- Replace costly operation with simpler one
- Shift, add instead of muultiply or divide
- e.g., `16 * x --> x << 40`
	- Utility machine dependent (该优化的收益~={cyan}取决于具体的机器硬件=~)
	- Depends on cost of multiply or divide instruction
		- On Intel Nehalem, integer multiply requires 3 CPU cycles

- Recognize sequence of products

优化前：
```C
for (i = 0; i < n; i++) {
    int ni = n * i;  // 关键点：每次外层循环都要算一次乘法
    for (j = 0; j < n; j++)
        a[ni + j] = b[j];
}
```
优化后（乘法->加法）：
```C
int ni = 0;          // 初始化为 0
for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++)
        a[ni + j] = b[j];
    ni += n;         // 关键点：乘法变加法！
}
```
# Optimization Blockers

## \#1: Procedure Calls

- Procedure to Convert String to Lower Case
```C
void lower(char *s)
{
	size_t i;
	for (i = 0; i < strlen(s); i++) // strlen()隐藏了n的复杂度！
		if (s[i] >= 'A' && s[i] <= 'Z')
			s[i] -= ('A' - 'a');
}
```
- CPU seconds和String length的~={yellow}**平方**=~成正比
- `strlen` executed ~={red}every iteration=~
- 而在~={green}面向对象编程=~（OOP）中，~={cyan}**字符串对象内部通常会维护一个`length`或者`size`变量**=~，这样使得`str.length()`的复杂度是$O(1)$，在性能上就是安全的了

- Improving Performance
```C
void lower(char *s)
{
	size_t i;
	size_t len = strlen(s);
	for (i = 0; i < len; i++)
	{
		if (s[i] >= 'A' && s[i] <= 'Z')
			s[i] -= ('A' - 'a');
	}
}
```

### Why could't compiler move `strlen` out of inner loop?

- Procedure may have ~={orange}**side effects**=~
	- Alters global state each time called
- Function may not return same value for given arguments
	- Depends on other parts of global state
	- Procedure `lower` could interact with `strlen`

- 编译器~={pink}不能假设`strlen(s)`每次执行的结果都一样=~
#### ~={red}Warning:=~
- Compiler treats procedure call as a black box
- Weak optimizations near them
#### Remedies:
- Use of inline functions （内联函数）
	- GCC does this with `-o1`
		- Within single file
- Do your own code motion

- 如果编译器能看到函数的源代码，它就能分析出函数没有副作用，从而大胆优化

#### Memory Matters

```C
/* Sum rows is of n X n matrix a
   and stores in vector b */
void sum_rows1(double *a, double *b, long n) {
    long i, j;
    for (i = 0; i < n; i++) {
        b[i] = 0;
        for (j = 0; j < n; j++) {
            b[i] += a[i * n + j];
        }
    }
}
```
汇编代码：
```Assembly
# 内层循环入口 (j = 0 到 n-1)
.L4:
    movsd   (%rsi,%rax,8), %xmm0  # FP Load: 从内存读取 b[i] 到寄存器 %xmm0
    addsd   (%rdi), %xmm0         # FP Add:  将 a[i*n + j] 加到 %xmm0 上
    movsd   %xmm0, (%rsi,%rax,8)  # FP Store: 把结果从寄存器写回内存b[i](这就是慢的原因)
    addq    $8, %rdi              # 指针移动，指向 a 的下一个元素
    cmpq    %rcx, %rdi            # 检查循环是否结束
    jne     .L4                   # 如果没结束，跳回 .L4
```
- Code updates `b[i]` on every iteration

- Why couldn't optimize this way?
	- 回答：因为编译器害怕~={cyan}**内存别名**=~（Memory Aliasing）
		- 它无从知道是否存在内存别名引用，除非做大量检查工作

	- 它只看到`*a`和`*b`，必须考虑一种极端情况：*~={yellow}万一`b[i]`的地址正好在数组`a`的中间呢？=~*
	- 所以必须马上把运算结果写回内存`b[i]`
	- ~={green}**规避原理：**=~ 假设 `b[i]` 的地址恰好就是后面某个 `a[j+1]` 的地址。因为它每一轮都把最新的结果写回了内存，那么下一轮读取 `a[j+1]` 时，取到的就是已经更新过的值

优化后汇编代码：
```Assmebly
# 优化后的内层循环，简单到只有这几行：
.L10:
    addsd   (%rdi), %xmm0    # 直接从内存 a 取值加到寄存器 %xmm0
    addq    $8, %rdi         # a 指针后移
    cmpq    %rax, %rdi       # 检查是否到行末
    jne     .L10             # 循环（这里面没有写内存的操作！）
```

源代码：
- 引入了一个~={yellow}**局部变量`val`**=~，编译器就可以大胆放入寄存器
- 也就是~={orange}显式=~地告诉寄存器：可以无视内存影响，提升优化程度

```C
void sum_rows2(double *a, double *b, long n) {
    long i, j;
    for (i = 0; i < n; i++) {
        double val = 0;             // 局部变量，编译器会将其映射到寄存器
        for (j = 0; j < n; j++) 
            val += a[i*n + j];      // 纯寄存器累加
        b[i] = val;                 // 出循环才写一次内存
    }
}
```

- 不过，对内存的读写才是主要因素，所以这里其实不会产生很巨大的性能增长

#### 所以要习惯~={purple}引入局部变量=~的写法

# Exploiting Instruction-Level Parallelism
指令级并行

## Benchmark Example: Data Type for Vectors
```C
/* 向量的数据结构定义 */
typedef struct {
    size_t len;     // 向量的长度
    data_t *data;   // 指向实际数据数组的指针
} vec;

/* 读取向量元素并存储在指针 val 指向的位置 */
int get_vec_element(vec *v, size_t idx, data_t *val)
{
    // 边界检查：如果索引超出长度或小于 0（size_t 总是大于等于 0）
    if (idx >= v->len)
        return 0;   // 越界，返回失败

    // 如果没越界，把数据取出来赋值给 *val
    *val = v->data[idx];
    return 1;       // 成功，返回 1
}
```

- 其中的`if`边界检查是降低性能的主要因素

### Cycles Per Element (CPE)
- Convenient way to express performance of program that operates on vectors or lists
- Length = n
- In our case: **~={red}CPE = cycles per OP=~**
- T = CPE * n + Overhead

## Pipelined Functional Units

流水线
- 其基本思想是把计算分解为一系列不同的阶段

```C
long mult_eg(long a, long b, long c) {
    long p1 = a * b;    // 乘法 1
    long p2 = a * c;    // 乘法 2
    long p3 = p1 * p2;  // 乘法 3（依赖前两个的结果）
    return p3;
}
```

| **阶段 (Stage)** | **Time 1** | **Time 2** | **Time 3** | **Time 4** | **Time 5** | **Time 6** | **Time 7** |
| -------------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| **Stage 1**    | `a * b`    | `a * c`    |            |            | `p1 * p2`  |            |            |
| **Stage 2**    |            | `a * b`    | `a * c`    |            |            | `p1 * p2`  |            |
| **Stage 3**    |            |            | `a * b`    | `a * c`    |            |            | `p1 * p2`  |


- Stage（阶段）是CPU执行单元内部的~={cyan}**物理流水线级**=~
- 它属于~={cyan}**微架构**=~（Microachitecture）层面，也就是CPU硬件电路设计的层面

- 这就是流水线操作的基本思想，它有点像并行性
- 但这种并行性~={yellow}并非拥有多个资源=~，而是把在单个硬件上的操作划分为紧密联系的顺序的~={yellow}多个步骤=~

## Loop Unrolling ( $2\times1$ )
循环展开

- 循环展开就是让循环体一次处理多个元素，从而减少循环控制（i++、条件跳转）的开销，让CPU把更多时间花在真正的“计算”上

```C
for (i = 0; i < limit; i += 2) {
	x = (x OP d[i]) OP d[i + 1];
}
```
- Combine 2 elements at a time

<table style="border-collapse: collapse; width: max-content; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 1em 0;">
  <thead>
    <tr>
      <th rowspan="2" style="border: 1px solid #ddd; padding: 8px 12px; background-color: #f5f5f5;">Method</th>
      <th colspan="2" style="border: 1px solid #ddd; padding: 8px 12px; background-color: #f5f5f5; text-align: center;">Integer</th>
      <th colspan="2" style="border: 1px solid #ddd; padding: 8px 12px; background-color: #f5f5f5; text-align: center;">Double FP</th>
    </tr>
    <tr>
      <!-- 第二行表头：由于第一列已被 rowspan 占用，此处直接定义具体运算列 -->
      <th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #fafafa;">Add</th>
      <th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #fafafa;">Mult</th>
      <th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #fafafa;">Add</th>
      <th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #fafafa;">Mult</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px 12px;"><strong>Combine4</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.27</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">5.01</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px 12px;"><strong>Unroll 2x1</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">5.01</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px 12px;"><strong>Unroll 2x1a</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.01</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.51</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.51</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">2.51</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px 12px;"><strong>Latency Bound</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.00</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.00</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">3.00</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">5.00</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px 12px;"><strong>Throughput Bound</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">0.50</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.00</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">1.00</td>
      <td style="border: 1px solid #ddd; padding: 8px 12px; text-align: right;">0.50</td>
    </tr>
  </tbody>
</table>
- 加法延迟只有 1
	- 这使得任何试图用 `x + (a+b)` 来重叠计算的想法，都会撞上“每周期最多吐出一个结果”的物理极限。要想突破 1.00 到达 0.50，必须用 **2x2 展开**（两个独立累加器），因为只有打破对 `x` 的依赖链，才能让两个加法单元同时开工

## Branch
### Branch Misprediction Invalidation

- 循环类的分支，绝大多数情况下都是 “Taken”，所以预测器会倾向于预测跳转
- 但循环的最后一次迭代会打破这个模式，导致~={yellow}**唯一的一次分支预测错误**=~，CPU 必须作废流水线中所有预取的错误指令，造成性能损失
