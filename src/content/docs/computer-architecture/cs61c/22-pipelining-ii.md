---
title: "22 Pipelining II"
description: UCB CS61C 流水线冒险与数据通路笔记
---

>实际上，没人用单周期 CPU……
>早期有过一些，不过都随着时间推移被淘汰了。
# 'Sequential' RISC-V Datapath
<a class="cs61c-note-image" href="/cs61c/22-sequential-risc-v-datapath.png" target="_blank" rel="noopener" aria-label="打开 Sequential RISC-V Datapath 原图">
  <img src="/cs61c/22-sequential-risc-v-datapath.png" alt="Sequential RISC-V Datapath" loading="lazy" decoding="async" />
  <span aria-hidden="true"></span>
</a>
它会一条一条执行指令，造成效率的低下。
# Pipelined RISC-V Datapath
<a class="cs61c-note-image" href="/cs61c/22-pipelined-risc-v-datapath.png" target="_blank" rel="noopener" aria-label="打开 Pipelined RISC-V Datapath 原图">
  <img src="/cs61c/22-pipelined-risc-v-datapath.png" alt="Pipelined RISC-V Datapath" loading="lazy" decoding="async" />
  <span aria-hidden="true"></span>
</a>
在这个过程中，我们必须用寄存器——流水线寄存器，将这些阶段分开。否则会导致所有的数据都混在一起。
与单周期相比，现在处理整条指令的时间变长了，这是因为时钟周期必须匹配流水线中~={yellow}最慢的=~阶段。我们设置一个固定的时钟周期来处理所有的阶段，如果有阶段比这更长，它将无法完成操作。
理论上，我们可以获得 ~={red}5=~ 倍的吞吐量提升，但由于各阶段的不平衡，我们损失了一点：最后是 ~={cyan}4=~ 倍。当然也已经非常可观了。
# Pipeline Hazards
- 中文名称：~={cyan}**流水线冒险**=~
- 阻止有指令在执行时启动新指令

大体上可以分为三类：结构冒险、数据冒险和控制冒险。
## 1) Structural hazard
- A required resource is busy

~={red}起因=~：两个及以上的指令竞争一个物理资源。
~={cyan}解决方案 1=~：指令轮流使用资源。这样一来，部分指令不得不停顿，直到前一条指令使用完该资源。停顿通常的实现方式是引入空操作。
~={cyan}解决方案 2=~：给机器添加硬件。
- 在大多数现代处理器中，我们很少会遇到结构冒险
- 将流水线设计得与 ISA 相匹配就可以防止这种冒险发生
	- ISA 有任何需求，我们都必须满足
### Regfile Structural Hazards
每条指令最多访问寄存器堆三次（两次读取和一次写入），寄存器堆必须支持这一点，否则将出现资源短缺。
### Memory Access
把内存区分成 IMEM 和 DMEM 两部分。如果只有一个内存，数据和指令存在一起，另一个可能读取指令的指令将不得不停顿。
## 2) Data hazard
- Data dependency between instructions
- Need to wait for previous instruction to complete its data read/write
### Example: Read and Write
对于 `add t0, t1, t2` ，结果写回寄存器发生在 WB 阶段。假如有一个 `sw t0, 4(t3)` 指令，是 `add` 指令后的第三个指令，那么寄存器堆将会被同时访问以进行读、写操作。
那么 store 会读取旧值还是我们希望它读取的新值呢？
寄存器堆被设置为支持单时钟周期读写。这使得 `add` 将在前 100ps 内完成写入，`sw` 在后 100ps 中完成读取。显然我们得到了正确的结果。不过也很显然的是，这高度依赖寄存器堆的具体实现。
### Example: ALU Result
设计一段疯狂的代码：
```
add s0, t0, t1
sub t2, s0, t0
or  t6, s0. t3
xor t5, t1, s0
sw  s0, 8(t3)
```
后续每个指令都要用到 `s0`。
所以所有的指令都需要 `add` 完成它的工作并把值写回寄存器堆。
#### Solution 1: Stalling
插入 Bubbles。它们什么都不做，只帮助将 `add` 的寄存器写回和 `sub` 的寄存器读取~={cyan}对齐=~。
<a class="cs61c-note-image" href="/cs61c/22-stalling-bubbles.png" target="_blank" rel="noopener" aria-label="打开 Stalling Bubbles 原图">
  <img src="/cs61c/22-stalling-bubbles.png" alt="Stalling Bubbles" loading="lazy" decoding="async" />
  <span aria-hidden="true"></span>
</a>
- Stalls reduce performance, but they are required
- 编译器可以插入 `nops`（`addi x0, x0, 0`）来避免冒险和停顿
#### Solution 2: Forwarding
不等写回，直接从 ALU 或在内存访问阶段获取该值，转发给 ALU 输入端，好让后续指令直接使用。
这需要在数据通路中添加一些旁路。叫短路也可以。
### Load Data Hazard
与~={red}加载=~相关的数据冲突，没有以上两种这么简单的解决方法。
设计代码：
```
lw  s2, 20(s1)
and s4, s2, s5
or  s8, s2, s6
add s9, s4, s2
slt s1, s6, s7
```
数据在第一条指令 MA 阶段结束时可用，比上面一种情况晚了一个时钟周期。
<a class="cs61c-note-image" href="/cs61c/22-load-data-hazard.png" target="_blank" rel="noopener" aria-label="打开 Load Data Hazard 原图">
  <img src="/cs61c/22-load-data-hazard.png" alt="Load Data Hazard" loading="lazy" decoding="async" />
  <span aria-hidden="true"></span>
</a>
从图中可以清晰地观察到，单靠转发不能解决问题。
所以我们只能 stall + forward，这样所有的下游指令都不会受影响。
我们将这里的 `and` 替换为 `nop`，并将所有指令向下游移动一个周期。
>那么我们具体如何实现这一点呢？
>在实际执行过程当中，当我们在周期结束时发现这是一个加载指令，我们已经取了 `and` 指令，且同时并没有取什么 `nop`。看上去一切好像都已经无法挽回。但我们注意到 `and` 的特性：它翻转一些位，但如果我们不让它写回结果，那么它和不存在也没有什么区别。这是解决问题的线索。因此，当我们在 ID 阶段发现有一个加载指令时，我们所需要做的就是~={yellow}*迅速设置所有将新状态写入处理器相关的控制信号为禁用*=~。如果没有状态更新（PC 还是那个 PC），下一条指令将是相同的指令。这时我们转发就来得及了。

简而言之，~={cyan}所有类型=~的加载指令都需要一个周期的流水线暂停。
- Slot after a load is called a ~={yellow}*load delay slot*=~（延迟槽）
	- 如果我们发现一个指令的操作数不依赖于加载的结果，就把它放到延迟槽中
		- 由编译器负责
		- 本质：~={cyan}**重排**=~代码，让下一个指令用不到 `load` 的结果
	- 这样一来就没有性能损失了！
## 3) Control hazard
- Flow of execution depends on previous instruction
- 如果流水线中正在执行的下一条指令是在分支指令之后，那么如果分支指令最终被执行，则下一条指令可能无效
### Example
`beq t0, t1, Label`
最早能确定分支是否被采用——即 `t0` 和 `t1` 是否相等——的时候是执行阶段结束时。这时，如果我们有合适的硬件支持，就可以更新程序计数器，使其变为 `Label` 的地址或下一条指令的地址。
`sub t2, s0, t0`
若下一条指令是一个 `sub`，那么它将在我们实际知道前一条指令是否分支前就进入流水线——无论分支条件的结果如何，它都会走完译码阶段。
因为我们在取分支后的两个时钟周期内不知道它是否会被执行，所以我们不应该执行接下来的两条指令。因此，在流水线的每个分支后，我们应该有两个停顿周期。
#### Kill Instructions after Branch if Taken
显然，上述做法会带来性能损失。我们得想想办法减轻损失：
- 如果分支没有被执行，顺序取出的指令就是对的
- 如果被执行了，我们就需要~={yellow}冲刷=~（flush）流水线

那么，我们如何取消指令？实际上这和 *Load Data Hazard* 一节提到的方式一致，即改变控制位，让它们不能改变处理器的状态。
#### Reducing Branch Penalties
我们可以观察到，分支指令要么大多数情况下会被执行，要么大多数情况下不会被执行。因此，我们可以~={cyan}**预测**=~它们会不会被执行。
有一些非常复杂的预测器。不过，我们也有一个很简单的单比特预测器：只需要保留一个比特，用于记录上一次这个分支是否被执行。
# Pipelining Datapath
我们的存储器读取和寄存器访问被视为组合逻辑操作——这意味着他们~={yellow}不依赖于时钟=~，一旦数据在输出端稳定，我们就认为该操作已经完成，并进入下一个阶段。
同理在 EX 阶段，当 ALU 的输出有效时，该阶段就完成了。
在阶段与阶段间的边界，我们需要放置一些寄存器。为了不产生新的需要理解的名称，它们被标记为 IF/ID、ID/EX、EX/MA、MA/WB。
IF/ID 需要保存 PC 和指令两个字段。每个流水线寄存器都必须保存与在该特定阶段执行的指令对应的位（指令 + 控制位）。否则我们就不知道这个阶段在干什么。
>PC 在 IF 阶段用于取指后，还要流水下去。在 ID 阶段它没什么用。而到了 EX 阶段，由于存在大量 ~={cyan}PC-relative=~ 操作，所以需要 PC 的值。在 MA 阶段它被 + 4 并传给 WB，最终交由 MUX 做出选择。
