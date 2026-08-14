---
title: "18 Single-Cycle CPU Datapath I"
description: UCB CS61C 单周期 CPU 数据通路笔记
---

# RISC-V Processor Design
# The CPU
- CPU is the active part of a computer where the main action happens
- ~={yellow}Datapath=~: portion of the processor that contains hardware necessary to perform operations required by the processor (the brawn)
	- 有时我们称它为处理器的“肌肉”
	- 我们可以为每条指令构建一个单独的数据路径
- ~={yellow}Control=~: portion of the processor (also in hardware) that tells the datapath what it needs to do
# Build a RISC-V Processor
- 我们可以将 CPU 设计视为状态机的设计
- CPU 中的状态包含在寄存器、内存和程序计数器中
	- 这将决定组合逻辑的功能
1. 我们可以为 RV32i 中的每条指令都设计一个专门的组合逻辑块，然后使用多路选择器来选择。但这并不实用，因为许多指令将共享相同的数据通路。
2. 因此，我们将尝试将数据通路构建为一个“逻辑云”，它可以执行所有指令。
对于~={cyan}单周期=~ CPU 而言，指令在 `clock` 的每个 `tick` 开始执行，通过组合逻辑（这里的“通过”指“go through”），其后将其输出呈现回状态元件。到了下一个时钟周期，它就被写回状态元件，作为新的状态。
很快我们就会发现，一个设想中可以执行所有指令的单片逻辑云也不实用，它太复杂了。
3. 因此，我们提出通用的解决方案：将指令的执行分解为多个阶段，并~={yellow}为每个阶段设置一个逻辑块=~
	- 这里包含了分而治之的思想
## Five Stages of the Datapath
- Stage 1: ***Instruction Fetch*** 指令获取（IF）
- Stage 2: ***Instruction Decode*** 指令解码（ID）
- Stage 3: ***Execute*** 执行（EX）- ALU
- Stage 4: ***Memory Access*** 内存访问（MEM）
- Stage 5: ***Write Back to Register*** 写回寄存器（WB）

所有这五个阶段在一个时钟周期内完成。

![单周期 CPU 数据通路总览](/cs61c/18-datapath-overview.png)

- PC（Program Counter，程序计数器）在顺序执行指令时，将增加 4 个字节，以指向 RISC-V 中的下一个 32 位字
- MUX 的用途：当分支需要跳转时，绕过正常的 `PC + 4` 路径，选择分支目标地址并将其写入 PC
- IMEM 发出与目标寄存器或第一、二个源寄存器相对应的地址
	- 它和 DMEM 仍然是同一物理内存的一部分，但我们将分别处理它们
## Datapath Components: Combinational
- Combinational elements:
	- Adder, Multiplexer, ALU...
- Storage elements + clock methodology
- Building blocks
## R-Type Add Datapath

![RISC-V R 型 ALU 指令编码表](/cs61c/18-r-type-instruction-format.png)

`add rd, rs1, rs2`

Instruction makes two changes to machine's state:

- `Reg[rd] = Reg[rs1] + Reg[rs2]`
- `PC = PC + 4`

![R 型 add 指令的数据通路](/cs61c/18-r-type-add-datapath.png)

### Sub Datapath

![R 型 add 与 sub 指令编码差异](/cs61c/18-add-sub-instruction-format.png)

- `inst[30]` selects between add and subtract
- 此前我们只需要一个支持 add 的 ALU，现在我们需要一个既支持 add 又支持 sub 的 ALU
以此为基础扩展到其他 R-type 指令也很简单。
## Datapath With Immediates
### `addi`

- RISC-V Assembly Instruction:
	`addi x15, x1, -50`

![addi 指令的 I 型立即数编码](/cs61c/18-addi-instruction-format.png)

- 相对于 add/sub，需要构建另一个支持立即数的数据通路（以替代 `Reg[rs2]`，两者之间通过 `BSel` 作选择）
	- 需要一个立即数生成器，由 `ImmSel` 信号控制
### I-Format Immediates

![I 型立即数的符号扩展](/cs61c/18-i-format-sign-extension.png)

- Sign-extended
