---
title: "20 Single-Cycle CPU Control"
description: UCB CS61C 单周期 CPU 控制逻辑笔记
---

经过 [18_Datapath1](/computer-architecture/cs61c/18-single-cycle-cpu-datapath-i/) 和 [19_Datapath2](/computer-architecture/cs61c/19-single-cycle-cpu-datapath-ii/)，我们已经完成了数据通路的设计，它是运行任何编译后的 `C` 程序的~={cyan}必要条件=~。不过我们还需要一些的别的东西。
# Control and Status Registers
- CSRs are ~={yellow}**separate**=~ from the register file (`x0-31`)
	- Used  for monitoring the status and performance
	- There can be up to 4096 CSRs
为了保持RISC-V 的基础 ISA 简洁，CSR 并不在其中（曾经在，但后来被删掉了）：它被拆成独立模块。但一个有用的 CPU 是离不开它的。它用于保存和控制处理器状态，如异常、中断、权限和性能计数等；还可以用于与协处理器（如浮点单元）或外围设备（如打印机）通信。
## CSR Instructions
<a class="cs61c-note-image" href="/cs61c/20-csr-instruction-format.png" target="_blank" rel="noopener" aria-label="打开 CSR 指令编码格式原图">
  <img src="/cs61c/20-csr-instruction-format.png" alt="CSR 指令编码格式" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

| Instr.    | rd    | rs    | Read CSR? | Write CSR? |
| --------- | ----- | ----- | --------- | ---------- |
| `csrrw`   | `x0`  | -     | no        | yes        |
| `csrrw`   | `!x0` | -     | yes       | yes        |
| `csrrs/c` | -     | `x0`  | yes       | no         |
| `csrrs/c` | -     | `!x0` | yes       | yes        |
- CSR 指令和 RV32i 普通指令一样，都是通过 PC 从同一个指令存储器（IMEM）中取出的
- 其中一半有寄存器操作数，另一半有立即数操作数
- 以上这些都有~={purple}**立即数变体**=~
### `csrrw`
- CSR read and write
`CSRRW rd, csr, rs1`：将 CSR 的原值写入 `rd`，同时将 `rs1` 的值写入 CSR。
# System Instructions
- `ecall` - (I-format) makes requests to supporting environment (OS), such as system calls (`syscalls`)
	- Linux 系统调用
- `ebreak` - (I-format) used e.g. by debuggers to transfer control to a debugging environment
- `fence` - sequences memory (and I/O) accesses as viewed by other threads or co-processors
- 以上三种都属于 RV32i
# Datapath Control
- 处理器内部有两个主要单元：~={orange}数据通路=~和~={yellow}控制单元=~
控制单元负责设置多路选择器们的和数据通路内其他的配置选项，以执行不同的指令。以下举几条指令的执行过程为例子：
## Examples
### `sw`
从 IMEM 中取指的传播延迟和固定给 PC 值 + 4 的传播延迟大致相同。
> 虽然我们说加法比取指要快得多，但这是相对于从内存中取指而言。在实际情况中，我们会从缓存中取指，这大大提升了速度。

控制逻辑（Control Logic）本质上就是一些我们见过的布尔逻辑门，它从指令中获取位，并根据它们确定控制信号。
由于这是一条存储字指令，它把 PCSel 设置为 + 4。一旦它这样做了，就会让 PC + 4 传播到程序计数器的输入端——但它~={yellow}暂时=~不会被写入程序计数器，直到我们到达下一个时钟周期。
所有其他控制信号~={red}***同时设置***=~：ImmSel 选择为 S 类型；RegWEn 设置为 0；BrUn 和 BrLT 我们不关心；Bsel 设置为 1（be picking an immediate）；Asel 设置为 0（`rs1` value）；ALUSel 设置为 add；MemRW 设置为 Write；WBSel 无关紧要。
立即数生成可能比从寄存器中获取数据花费更长时间，因为它受制于搞清楚我们想要哪种立即数，但总体而言两者是一个量级的。因此，我们会在大致相同的时间获得 `rs1`、`rs2` 和立即数的值。
### `beq`
PC + 4 也会被计算。不过，因为是分支指令，这个结果最后有可能不会被选择。
# Instruction Timing
## Example: `add`
```
时钟沿
  ↓
PC 给出地址
  ↓
IMEM 取出 add 指令
  ↓
解析 rs1=x6, rs2=x7, rd=x5
  ↓
Register File 读出 x6 和 x7
  ↓
ALU 做加法
  ↓
结果经过 WBSel MUX
  ↓
下一个时钟沿
  ↓
结果写入 x5
```
## Example: `lw`
<a class="cs61c-note-image" href="/cs61c/20-lw-control-datapath.png" target="_blank" rel="noopener" aria-label="打开 lw 控制数据通路原图">
  <img src="/cs61c/20-lw-control-datapath.png" alt="lw 控制数据通路" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

Critical Path =
$$
t_{\mathrm{clk-q}}+
\max\left\{
\begin{array}{l}
t_{\mathrm{Add}}+t_{\mathrm{mux}},\\
t_{\mathrm{IMEM}}+t_{\mathrm{Imm}}+t_{\mathrm{mux}}+t_{\mathrm{ALU}}+t_{\mathrm{DMEM}}+t_{\mathrm{mux}},\\
t_{\mathrm{IMEM}}+t_{\mathrm{Reg}}+t_{\mathrm{mux}}+t_{\mathrm{ALU}}+t_{\mathrm{DMEM}}+t_{\mathrm{mux}}
\end{array}
\right\}
+t_{\mathrm{setup}}
$$
<a class="cs61c-note-image" href="/cs61c/20-single-cycle-timing.png" target="_blank" rel="noopener" aria-label="打开单周期 CPU 指令时序原图">
  <img src="/cs61c/20-single-cycle-timing.png" alt="单周期 CPU 指令时序" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

## Comparison
<a class="cs61c-note-image" href="/cs61c/20-instruction-latency-comparison.png" target="_blank" rel="noopener" aria-label="打开单周期 CPU 指令延迟比较原图">
  <img src="/cs61c/20-instruction-latency-comparison.png" alt="单周期 CPU 指令延迟比较" loading="lazy" decoding="async" />
  <span aria-hidden="true">↗ 原图</span>
</a>

- Maximum clock frequency
	- $f_{max}=1/800\,ps=1.25\,GHz$
- Most blocks idle most of the time
	- E.g. $f_{max,ALU}=1/200\,ps=5\,GHz$
# Control Logic Design
- 控制逻辑其实可以被看作一个~={cyan}查找表=~
	- 列是控制位，行是指令

|Inst[31:0]|BrEq|BrLT|PCSel|ImmSel|BrUn|ASel|BSel|ALUSel|MemRW|RegWEn|WBSel|
|---|--:|--:|---|---|--:|---|---|---|---|--:|---|
|`add`|*|*|+4|*|*|Reg|Reg|Add|Read|1|ALU|
|`sub`|*|*|+4|*|*|Reg|Reg|Sub|Read|1|ALU|
|`(R-R Op)`|*|*|+4|*|*|Reg|Reg|(Op)|Read|1|ALU|
|`addi`|*|*|+4|I|*|Reg|Imm|Add|Read|1|ALU|
|`lw`|*|*|+4|I|*|Reg|Imm|Add|Read|1|Mem|
|`sw`|*|*|+4|S|*|Reg|Imm|Add|Write|0|*|
|`beq`|0|*|+4|B|*|PC|Imm|Add|Read|0|*|
|`beq`|1|*|ALU|B|*|PC|Imm|Add|Read|0|*|
|`bne`|0|*|ALU|B|*|PC|Imm|Add|Read|0|*|
|`bne`|1|*|+4|B|*|PC|Imm|Add|Read|0|*|
|`blt`|*|1|ALU|B|0|PC|Imm|Add|Read|0|*|
|`bltu`|*|1|ALU|B|1|PC|Imm|Add|Read|0|*|
|`jalr`|*|*|ALU|I|*|Reg|Imm|Add|Read|1|PC+4|
|`jal`|*|*|ALU|J|*|PC|Imm|Add|Read|1|PC+4|
|`auipc`|*|*|+4|U|*|PC|Imm|Add|Read|1|ALU|
那么我们如何实现这个真值表呢？
## Control Realization Options
- ~={yellow}ROM=~
	- "Read-Only Memory"
	- Regular structure
	- ~={cyan}Can be easily reprogrammed=~
		- fix errors
		- add instructions
	- Popular when designing control logic manuallu
- ~={yellow}Combinational Logic=~
	- Today, chip designers use logic synthesis tools to convert truth tables to networks of gates
	- a bunch of ANDs and ORs
	- 这样更紧凑，速度也更快
### RV32i, A 9-bit ISA!
如果目的仅仅是判断是哪一条指令，那么其实大部分时候看以下九位就行了：
`inst[6:2], inst[14:12], inst[30]`
