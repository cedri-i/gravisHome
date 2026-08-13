---
title: "19 Single-Cycle CPU Datapath II"
description: UCB CS61C 单周期 CPU 数据通路笔记
---

本节笔记顺承 [18 Single-Cycle CPU Datapath I](/computer-architecture/cs61c/18-single-cycle-cpu-datapath-i/)。

## Review

- 目前构建的数据通路只涉及 4 个执行阶段，因为 R-Type 和普通 I-Type 都不访问内存

## Supporting Loads

- 为了支持加载和存储，必须用到 DMEM

> RISC-V 是所谓的“加载-存储”架构，其中所有与内存的操作都只通过加载和存储指令完成。这也就是说，CPU 在运算时，操作数不能~={yellow}**直接**=~来自内存：不存在一条单一指令完成 $Mem[A] = Mem[A] + 5$。其他 ISA 如 x86 则允许这一点。

<a class="cs61c-note-image" href="/cs61c/19-load-datapath.png" target="_blank" rel="noopener" aria-label="打开 load 指令数据通路原图">
  <img src="/cs61c/19-load-datapath.png" alt="load 指令数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

### Add `lw`

- I-Type
  - 它的立即数格式和之前学到的 I 类型指令一致
- RISC-V Assembly Instruction: `lw x14, 8(x2)`

<a class="cs61c-note-image" href="/cs61c/19-lw-instruction-format.png" target="_blank" rel="noopener" aria-label="打开 lw 指令编码格式原图">
  <img src="/cs61c/19-lw-instruction-format.png" alt="lw 指令编码格式" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- 12 位的有符号立即数 + 寄存器 `rs1` 中的基址 = 内存地址
  - 先符号扩展再加
- 从内存中加载出来的值被存储在寄存器 `rd` 中

### 新增信号

#### MemRW

- 有 Read 和 Write 两个状态，控制是~={cyan}读 DMEM=~还是~={blue}写 DMEM=~

#### WBSel

- Write back select
- 控制一个多路选择器
  - 选择写回操作数的来源是~={cyan}ALU=~还是~={blue}内存=~

<a class="cs61c-note-image" href="/cs61c/19-load-control-signals.png" target="_blank" rel="noopener" aria-label="打开 load 控制信号原图">
  <img src="/cs61c/19-load-control-signals.png" alt="load 控制信号" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- ImmSel = I
- RegWEn = 1
- BSel = 1
- ALUSel = Add
- MemRW = Read
- WBSel = 0（对应内存）

加载字节和半字需要添加一个额外的多路选择器和一些逻辑门。

## Datapath for Stores

<a class="cs61c-note-image" href="/cs61c/19-store-datapath.png" target="_blank" rel="noopener" aria-label="打开 store 指令数据通路原图">
  <img src="/cs61c/19-store-datapath.png" alt="store 指令数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- `sw`: Reads 2 registers, `rs1` for base memory address, and `rs2` for data to be stored, as well immediate offset
- `sw x14, 8(x2)`

<a class="cs61c-note-image" href="/cs61c/19-sw-instruction-format.png" target="_blank" rel="noopener" aria-label="打开 sw 指令编码格式原图">
  <img src="/cs61c/19-sw-instruction-format.png" alt="sw 指令编码格式" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- 由上图可见，我们其实可以复用 load 操作的大部分数据通路

在存储指令中，12 位 offset 被拆成两部分编码。这样设计是为了让 `rs1` 和 `rs2` 的寄存器编号字段在不同指令格式中保持固定位置，从而简化并加速指令译码，因为寄存器索引的提取通常位于关键路径上。因为编码位置的不同，load 使用 I-type 编码，而 store 使用 S-type 编码。不过，它们都是 12 位有符号立即数。

- ImmSel = S
- RegWEn = 0
- BSel = 1
- ALUSel = Add
- MemRW = Write
- WBSel = \*（don't care）

### I+S Immediate Generation

<a class="cs61c-note-image" href="/cs61c/19-i-s-immediate-generation.png" target="_blank" rel="noopener" aria-label="打开 I 型与 S 型立即数生成原图">
  <img src="/cs61c/19-i-s-immediate-generation.png" alt="I 型与 S 型立即数生成" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- 只需要一个 5-bit 的多路选择器在两个位置之间选择
  - 对于 I-Type 使用 24 到 20 位
  - 对于 S-Type 使用 11 到 7 位

## Implementing Branches

- 分支指令比较 `rs1` 和 `rs2` 的内容，并根据分支条件更新程序计数器
- B 类型的编码格式和 S 类型类似，不同之处在于立即数使用 12 位来编码 13 位的范围
  - 最后一位始终为 0
  - 我们用此范围来表示 -4096 到 4094 之间的值，步长为 2 个字节

处理这个类型的指令时，显然我们用不上内存，也不关寄存器堆的事。因此数据通路的很多部分都不会被点亮。不过我们也需要额外的资源。

### To Add Branches

- Different change to the state:
  - PC = PC + 4, branch not taken
  - PC = PC + immediate, branch taken
- Six branch instructions: `beq, bne, blt, bge, bltu, bgeu`
- 现在，状态改变不再通过改变寄存器或内存的内容来实现，而是通过改变程序计数器实现

<a class="cs61c-note-image" href="/cs61c/19-branch-datapath.png" target="_blank" rel="noopener" aria-label="打开分支指令数据通路原图">
  <img src="/cs61c/19-branch-datapath.png" alt="分支指令数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

#### Branch Comparator

<div class="cs61c-figure-aside">

<a class="cs61c-note-image" href="/cs61c/19-branch-comparator.png" target="_blank" rel="noopener" aria-label="打开分支比较器原图">
  <img src="/cs61c/19-branch-comparator.png" alt="分支比较器" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

<ul class="cs61c-figure-notes">
  <li><code>BrEq = 1, if A = B</code></li>
  <li><code>BrLT = 1, if A &lt; B</code></li>
  <li><code>BrUn = 1</code> selects unsigned comparison for <code>BrLT</code>, 0 = signed</li>
</ul>

</div>

#### Branch Immediates

<a class="cs61c-note-image" href="/cs61c/19-branch-immediate.png" target="_blank" rel="noopener" aria-label="打开分支立即数编码原图">
  <img src="/cs61c/19-branch-immediate.png" alt="分支立即数编码" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

## Adding `JALR` to Datapath

- Jump and Link Register
- 经常被用于进行函数调用
- I-Format

<a class="cs61c-note-image" href="/cs61c/19-jalr-instruction-format.png" target="_blank" rel="noopener" aria-label="打开 JALR 指令编码格式原图">
  <img src="/cs61c/19-jalr-instruction-format.png" alt="JALR 指令编码格式" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- `JALR rd, rs, immediate`
- Two changes to the state
  - Writes PC + 4 to `rd` (return address)
  - Sets PC = `rs1 + immediate`
  - Uses same immediate as arithmetic annd loads

在这种指令使用 immediate 是一种折中的方案，因为其最后一位总是 0。我们损失了一些跳转范围，不过总体而言数据通路更为简便了。

<a class="cs61c-note-image" href="/cs61c/19-jalr-datapath.png" target="_blank" rel="noopener" aria-label="打开 JALR 指令数据通路原图">
  <img src="/cs61c/19-jalr-datapath.png" alt="JALR 指令数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

## Adding `JAL`

- Jump and Link
- ~={yellow}唯一一个 J 格式指令=~
- Two changes to the state
  - `jal` saves PC + 4 in register `rd` (the return address)
  - Set PC = PC + offset (PC-relative jump)
- Target somewherr within ±$2^{19}$ locations, 2 bytes apart
  - ±$2^{18}$ 32-bit instructions
- Immediate encoding optimized similarly to branch instruction to reduce hardware cost
- 数据通路中基本上已经应有尽有了，只需要一些多路选择器

## Adding U-Types

<a class="cs61c-note-image" href="/cs61c/19-u-type-instruction-format.png" target="_blank" rel="noopener" aria-label="打开 U 型指令编码格式原图">
  <img src="/cs61c/19-u-type-instruction-format.png" alt="U 型指令编码格式" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- 用于支持那些~={cyan}**超长立即数**=~
- Used for two instructions:
  - `lui` - Load Upper Immediate
  - `auipc` - Add Upper Immediate to PC
- 添加需要的硬件

# Conclusion

我们已经设计好了完整的数据通路——它可以执行 RISC-V ISA 中的每一条 RB32i 指令，也就意味着执行任何可以编译成 RISC-V 汇编的 `C` 程序。

<a class="cs61c-note-image" href="/cs61c/19-complete-datapath.png" target="_blank" rel="noopener" aria-label="打开完整单周期 CPU 数据通路原图">
  <img src="/cs61c/19-complete-datapath.png" alt="完整单周期 CPU 数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>
