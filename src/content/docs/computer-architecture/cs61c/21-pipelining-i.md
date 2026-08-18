---
title: "21 Pipelining I"
description: UCB CS61C 流水线与处理器性能笔记
---

在这个单元中，我们将用不同的测量方法实际测量性能，并找出提高性能的方法。
这里的逻辑关系是：我们首先需要知道如何测量，才能知道如何改进。
# 6 Great Ideas in Computer Architecture
1. Abstraction (Layers of Representation/Interpretation)
2. Moore’s Law
3. Principle of Locality/Memory Hierarchy
4. Parallelism
5. ~={yellow}Performance Measurement & Improvement=~
6. Dependability via Redundancy
# Measures of Performance
## Instruction Timing
我们有一个性能指标，即在我们的单周期 RISC-V CPU 中执行一条指令所需的~={cyan}最小周期时间=~。我们通过测量五个执行阶段中每个阶段所需的时间来确定这个时间。
<a class="cs61c-note-image" href="/cs61c/21-instruction-timing-stages.png" target="_blank" rel="noopener" aria-label="打开指令执行阶段原图">
  <img src="/cs61c/21-instruction-timing-stages.png" alt="指令执行阶段" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

并不是每条指令都会经历所有五个执行阶段：我们发现只有 `lw` 指令会经历所有五个执行阶段。
<a class="cs61c-note-image" href="/cs61c/21-single-cycle-instruction-timings.png" target="_blank" rel="noopener" aria-label="打开单周期指令时序原图">
  <img src="/cs61c/21-single-cycle-instruction-timings.png" alt="单周期指令时序" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

按照这个标准，我们的单周期 CPU 每秒可以完成 12.5 条指令。
- 我们能提升它吗？
- 有若干个不同的理解视角：
	- ~={yellow}单个=~任务完成时间
	- ~={orange}多个=~任务平均时间
	- 消耗的~={red}能量=~

与交通对比理解：
<a class="cs61c-note-image" href="/cs61c/21-performance-perspectives-traffic.png" target="_blank" rel="noopener" aria-label="打开交通类比性能视角原图">
  <img src="/cs61c/21-performance-perspectives-traffic.png" alt="交通类比性能视角" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

# Processor Performance Iron Law
这条“铁律”告诉我们根据机器和程序的一些基本参数，执行程序需要多长时间：
$$
\boxed{
\frac{\text{Time}}{\text{Program}}
=
\frac{\text{Instructions}}{\text{Program}}
\times
\frac{\text{Cycles}}{\text{Instruction}}
\times
\frac{\text{Time}}{\text{Cycle}}
}
$$
CPI = Cycles Per Instruction
这些参数都不能单独分析，必须放在一起才能理解执行任务需要多长时间
## Instructions per Program
Determined by
- Task
- Algorithm, e.g. $O(N^2)$ vs $O(N)$
- Programming Language
- Compiler
- Instruction Set Architecture (ISA)
	- 大多数 RISC 比 CISC 类型处理器需要更多的汇编级指令
## Clock Cycles per Instruction
Determined by
- ISA
- Processor implementation (or *microarchitecture*)
	- Intel 的高低端处理器之间亦有差距
	- AMD 和 Intel 之间因为实现方式不同也会有不同
- E.g. for "our" single-cycle RISC-V design, CPI = 1
- Complex instructions (e.g. `strcpy`), CPI >> 1
- Superscalar processors, CPI < 1
	- 对于~={cyan}超标量处理器=~，一个时钟周期可以完成不止一条指令
## Time per Cycle
Determined by
- Processor microarchitecture (determines critical path through logic gates)
- Technology
- Power budget
	- Lower voltages reduce transistor speed
## Example
<a class="cs61c-note-image" href="/cs61c/21-processor-performance-example.png" target="_blank" rel="noopener" aria-label="打开处理器性能铁律示例原图">
  <img src="/cs61c/21-processor-performance-example.png" alt="处理器性能铁律示例" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

对于这个任务，处理器 B 是更好的选择——即使它要执行的指令更多，每一个时钟周期也更长。
~={pink}如果我们要去购买处理器，需要特别关注这一点。=~
# Energy Efficiency
~={yellow}**能效**=~，是指处理器性能和功耗之间的关系。
>在 80 年代，设计师们并不在意能效——那时唯一的目标就是尽可能提高性能（performance）！为此他们无所不用其极：缩短 logic depth（指缩短一个时钟周期关键路径中串联的逻辑门层数），使用最大的电源电压……这导致在性能每年翻一番的同时，功耗也每三年就翻一番。在当时处理器很简单，功耗高不到哪里去，所以这不成问题；但到了本世纪初期，功耗成为主要的限制因素。
>现在，和可预见的未来，最主要的设计目标都是~={cyan}**在功率限制下最大化性能**=~。
## Where Does Energy Go in CMOS?
<a class="cs61c-note-image" href="/cs61c/21-cmos-inverter-abstractions.png" target="_blank" rel="noopener" aria-label="打开 CMOS 反相器抽象层次原图">
  <img src="/cs61c/21-cmos-inverter-abstractions.png" alt="CMOS 反相器抽象层次" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

上面两张图是反相器不同的抽象级别。 
我们在反相器中使用的每个晶体管都有其输入和输出电容。因此，每当我们试图将输出电平从 0 切换到 1 时，我们必须给电容器充电。该电容器由位于该反相器输出端的电容以及任何位于该反相器下游的、由该反相器驱动的反相器输入端的电容组成。这个过程的能量损耗就是当今 CMOS 技术中功耗的主要部分。
## Energy per Task
$$
\fbox{
  \(\displaystyle
  \frac{\text{Energy}}{\text{Program}}
  =
  \frac{\text{Instructions}}{\text{Program}}
  \times
  \frac{\text{Energy}}{\text{Instruction}}
  \)
}
$$
## Energy "Iron Law"
$$
\begin{array}{c}
\text{Performance} \\
(\textit{Tasks/Second})
\end{array}
=
\begin{array}{c}
\text{Power} \\
(\textit{Joules/Second})
\end{array}
\times
\begin{array}{c}
\text{Energy Efficiency} \\
(\textit{Tasks/Joule})
\end{array}
$$
# Intruduction to Pipelining
- Pipeline rate limited by ~={yellow}slowest=~ pipeline stage
## Laundry
### Sequential Laundry
<a class="cs61c-note-image" href="/cs61c/21-sequential-laundry.png" target="_blank" rel="noopener" aria-label="打开顺序洗衣示例原图">
  <img src="/cs61c/21-sequential-laundry.png" alt="顺序洗衣示例" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

### Pipelined Laundry
<a class="cs61c-note-image" href="/cs61c/21-pipelined-laundry.png" target="_blank" rel="noopener" aria-label="打开流水线洗衣示例原图">
  <img src="/cs61c/21-pipelined-laundry.png" alt="流水线洗衣示例" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>
