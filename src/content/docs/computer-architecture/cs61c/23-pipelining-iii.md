---
title: "23 Pipelining III"
description: UCB CS61C 流水线与超标量处理器笔记
---

因为主要是展开讲上一集的内容，故内容大都在 [22 Pipelining II](/computer-architecture/cs61c/22-pipelining-ii/) 笔记中。
# Increasing Processor Performance
1. Clock Rate
	- 受到两件事的限制：晶体管开关速率和能耗
2. Pipelining
	- "Overlap" instruction execution
	- Deeper pipeline: 5 -> 10 -> 15 stages
		- ~={cyan}Less work per stage -> shorter clock cycle=~
		- ~={green}But more potential for hazards (CPI > 1)=~
# Superscalar Processors
作为上述方案的替代方案出现的即超标量处理器。理论上它们的 CPI 可以远低于 1。
本质：~={orange}**通过增加处理器的“宽度”，让一个时钟周期内可以同时处理、发射并执行多条彼此独立的指令，从而利用指令级并行性（ILP）。**=~
## "Out-of-Order" Execution
 为了处理依赖关系和冒险，我们设计一个硬件单元，它会选择并确定哪些指令有依赖关系，并尝试按不互相依赖的顺序完成它们。
 与此同时，在流水线的末端放一个重新排序单元，它会将结果按顺序放回，以便运行该程序的人得到有意义的结果。
