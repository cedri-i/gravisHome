---
title: "Lecture 11"
---

[[Lecture 11#Storage technologies and trends]]
[[#Locality of reference]]
[[#Caching in the memory hierarchy]]
# The Memory Hierarchy
探寻存储器层次结构是怎么构建的
目标是高层次理解

```mermaid
graph TD
    %% 定义颜色样式
    classDef registers fill:#ff9999,stroke:#333,stroke-width:2px;
    classDef cache fill:#ffcc99,stroke:#333,stroke-width:2px;
    classDef memory fill:#ffff99,stroke:#333,stroke-width:2px;
    classDef disk fill:#99ff99,stroke:#333,stroke-width:2px;
    classDef remote fill:#99ccff,stroke:#333,stroke-width:2px;

    %% 金字塔层级定义
    Reg(<b>寄存器 Registers</b><br/>速度: 极快 &lt;1ns / 容量: 字节级)
    L1(<b>高速缓存 L1/L2/L3 Cache</b><br/>速度: 1-10ns / 容量: KB-MB级)
    RAM(<b>主存 Main Memory / RAM</b><br/>速度: ~100ns / 容量: GB级)
    Disk(<b>本地磁盘 SSD/HDD</b><br/>速度: 10us-10ms / 容量: TB级)
    Remote(<b>分布式/远程存储</b><br/>速度: &gt;10ms / 容量: PB级)

    %% 连接关系
    Reg --- L1 --- RAM --- Disk --- Remote

    %% 应用样式
    class Reg registers;
    class L1 cache;
    class RAM memory;
    class Disk disk;
    class Remote remote;

    %% 补充侧边趋势说明
    subgraph Legend [存储特性趋势]
        direction BT
        UP[速度快 / 成本高 / 容量小]
        DOWN[速度慢 / 成本低 / 容量大]
        DOWN -.-> UP
    end
```

# Storage technologies and trends

## Random-Access Memory (RAM)
### Key features
- ~={red}RAM=~ is traditionally packaged as a chip
- Basic storage unit is normally a ~={red}cell=~ (one bit per cell)
- Multiple RAM chips form a memory

### RAM comes in two varieties:
- SRAM (Static RAM)
- DRAM (dynamic RAM)

- 区分：根据~={cyan}存储单元实现方式=~
#### SRAM vs DRAM Summary

| **特性**   | **每比特晶体管数 (Trans. per bit)** | **访问时间 (Access time)** | **是否需要刷新 (Needs refresh?)** | **Needs EDC?** | **Cost** | **Applications**                        |
| -------- | ---------------------------- | ---------------------- | --------------------------- | -------------- | -------- | --------------------------------------- |
| **SRAM** | 4 或 6                        | 1X                     | 否 (No)                      | 可能 (Maybe)     | 100X     | 高速缓存 (Cache memories)                   |
| **DRAM** | 1                            | 10X                    | 是 (Yes)                     | 是 (Yes)        | 1X       | 主存 (Main memories), 帧缓冲 (frame buffers) |
- DRAM需要插着电使用
	- 若不插电，它会丢失电荷，也就是丢失保存的信息
	- 插电时不用刷新

- SRAM更加可靠

- 但它们都是volatile memories (易失的)

## Nonvolatile Memories (非易失性存储器)
- 即使断电也可以保留信息

- 它们之中很多被称为~={cyan}只读内存=~
	- Read-only memory (~={red}ROM=~): programmed during production
- Programmable ROM (~={red}PROM=~): can be programmed once
- Eraseable PROM (~={red}EPROM=~): can be bulk erased (UV, X-Ray)
- Electrically eraseable PROM (~={red}EEPROM=~): electronic erase capability
- Flash memory: EEPROMs, with partial (block-level) erase capability
	- Wears out after about 100,000 erasings
	- 可以删除闪存上面的存储块，十万次擦除之后就会磨损

### Uses for Nonvolatile Memories
- Fileware programs stored in a ROM (BIOS, controllers for disks, network cards, graphics accelerators, security subsystems, ...)
- Solid state disks
- Disk caches

### History

- 以前，很多早期ROM只能~={cyan}在其芯片生产期间被硬编码一次=~
- 如今，ROM的编程、删除方式都有所改进
	- So they can be reprogrammed

## Traditional Bus Structure Connecting CPU and Memory
Bus: 总线

- A ~={red}**bus**=~ is a collection of parallel wires that carry address, data, and control signals
	- 一组并行的导线，负责在各个组件之间传递地址、数据和控制信号
		- 地址总线
		- 数据总线
		- 控制总线
- Buses are typically shared by multiple devices

```mermaid
graph LR
    %% 定义 CPU 内部区域
    subgraph CPU ["CPU 芯片 (CPU Chip)"]
        direction TB
        RF["寄存器文件 (Register File)"] <--> ALU["算术逻辑单元 (ALU)"]
        BI["总线接口 (Bus Interface)"] <--> RF
    end

    %% 定义外部组件
    Bridge(("I/O 桥 (I/O Bridge)"))
    MainMem[("主存 (Main Memory)")]

    %% 连线：总线结构
    BI <== "系统总线 (System Bus)" ==> Bridge
    Bridge <== "内存总线 (Memory Bus)" ==> MainMem

    %% 样式美化
    style CPU fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Bridge fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style MainMem fill:#e1f5fe,stroke:#01579b
    style RF fill:#fff,stroke:#333
    style ALU fill:#fff,stroke:#333
```

### Register File
所谓寄存器文件：
- 很多个寄存器集成在一起组成的硬件模块

### I/O Bridge
所谓I/O桥：
- 它的存在就是为了让CPU、内存和各种外部设备（如硬盘、显卡、键盘）能~={purple}**互相通信**=~
- 而本来这些组件在速度、电压、协议等方面迥然不同
	- I/O桥即负责~={yellow}**协议转换、速度缓冲、路由转发**=~
- 早期主板上I/O桥通常由~={yellow}两块大芯片=~组成：
#### Northbridge
- 靠近CPU
- 连接高速设备
#### Southbridge
- 远离CPU
- 连接低速设备

### Memory Read Transaction

~={red}Load operation=~: `movq A, %rax`
1. CPU places address A on the memory bus
2. Main memory reads A from the memory bus, retrieves word x, and places it on the bus
### Memory Write Transaction

~={red}Store operation=~: `movq %rax, A`
1. CPU places address A on bus. Main memory reads it and waits for the corresponding data word to arrive
2. CPU places data word y on the bus
3. Main memory reads data word y from the bus and stores it at address A

## Disk Geometry
- Disks consist of ~={yellow}**platters**=~(盘面), each with two~={green} **surfaces**=~(表面)
- Each ~={green}**surface**=~ consists of concentric rings(同心圆) called~={cyan} **tracks**=~(磁道)
- Each ~={cyan}**track**=~ consists of ~={blue}**sectors**=~(扇区) separated by gaps
	- 扇区存储着数据，每个扇区存储==512个字节==

### Disk Capacity

- **~={orange}Capacity=~**: maximum number of bits that can be stored
	- Vendors(供应商) express capacity in units of gigabytes (GB), where 1 GB = 10$^9$ Bytes
- Capacity is determined by these technology factors:
	- ==Recording density== (bits/in): number of bits that can be spueezed into a 1 inch segment of a track
	- ==Track density== (tracks/in): number of tracks that can be squeezed into a 1 inch radial  segment
	- ==Areal density== (bits/in2): product of recording and track density

#### Computing Disk Capacity

~={yellow}**~={red}Capacity = (# bytes/sector) $\times$ (avg. # sectors/track) $\times$ (# tracks/surface) $\times$ =~**=~
~={red}**(# surfaces/platter) $\times$ (# platters/disk)** =~

# Locality of reference
访问的局部性
- 程序在执行时，~={cyan}**所访问的指令或数据往往呈现出“成群结队”的特征**=~，而不是随机分布在内存中的

## Locality to the rescue!

#### The key to bridging this CPU-Memory gap is a fundamental property of computer programs known as ~={red}locality=~
它弥合内存和CPU之间的差距

## Locality

- ==Principle of Locality==: Programs tend to use data and instructions with addresses near or equal to those they have used recently

### Temporal Locality
时间局部性
- Recently referenced items are likely to be referenced again in the near future

### Spatial Locality
空间局部性
- Items with nearby addresses tend to be referenced close together in time

### Example1

```C
sum = 0;
for (i = 0; i < n; i++)
	sum += a[i];
return sum;
```
- ~={yellow}**Data references**=~
	- References array elements in succession
	- Reference variable `sum` each iteration
- ~={yellow}**Instruction references**=~
	- Reference instructions in sequence
	- Cycle through loop repeatedly

## Qualitative Estimates of Locality

作为程序员，要能够对一段代码的局部性优良作~={green}**定性的判断**=~

如：
```C
for (i = 0; i < M; i++)
	for (j = 0; j < N; j++)
		sum += a[i][j]; 
```
这个非常不错！⬆️

但：
```C
for (i = 0; i < M; i++)
	for (j = 0; j < N; j++)
		sum += a[j][i]; 
```
这个相比于上一个~={red}**慢一个数量级**=~！

### Example2

三维数组：
```C
// a[M][N][N]
for (i = 0; i < M; i++)
	for (j = 0; j < N; j++)
		for (k = 0; k < N; k++)
			sum += a[i][j][k];
```
此即最佳写法！

# Caching in the memory hierarchy

将由[[Lecture 12]]详细介绍！

## Caches

- ~={red}**Cache:**=~ A smaller, faster storage device that acts as a staging area for a subset of the data in a larger, slower device

- Fundamental idea of a memory hierarchy:
	- For each $k$, the faster, smaller device at level $k$ serves as a cache for the larger, slower device at level $k+1$
		- 比如：可以把主存当成存储在磁盘的数据的缓存

- Why do memory hierarchies work?
	- Because of locality, programs tend to access the data at level $k$ ==more often== than they access at level $k+1$ 
	- Thus, the storage at level $k+1$ can be slower, and thus larger and cheaper per bit

- ~={red}**Big Idea:**=~ The memory hierarchy creates a large pool of storage that costs as much as the cheap storage near the bottom, but that serves data to programs at the rate of the fast storage near the top

## General Cache Concepts

- 在各种缓存中都有某种~={cyan}**传输单元**=~
	- 在层级之间来回拷贝

<div style="background-color: #ffffff; padding: 40px; border-radius: 12px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
    
    <div style="margin-bottom: 30px; text-align: center;">
        <h2 style="margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em;">存储器缓存分层演示</h2>
        <p style="margin-top: 4px; color: #64748b; font-size: 0.875rem;">Memory Hierarchy & Data Blocks</p>
    </div>

    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
        <div style="width: 100%; max-width: 450px; position: relative; background: #f8fafc; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);">
            <div style="position: absolute; left: -90px; top: 50%; transform: translateY(-50%); font-weight: 900; color: #3b82f6; font-size: 1.2rem; transform: rotate(-90deg);">CACHE</div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div style="background: #ffffff; border: 1px solid #3b82f6; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1e3a8a; border-radius: 4px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05);">8</div>
                <div style="background: #ffffff; border: 1px solid #3b82f6; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1e3a8a; border-radius: 4px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05);">9</div>
                <div style="background: #ffffff; border: 1px solid #3b82f6; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1e3a8a; border-radius: 4px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05);">14</div>
                <div style="background: #ffffff; border: 1px solid #3b82f6; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1e3a8a; border-radius: 4px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05);">3</div>
            </div>
            
            <div style="position: absolute; right: -240px; top: 50%; transform: translateY(-50%); width: 210px; font-size: 0.8rem; color: #475569; line-height: 1.4;">
                <strong style="color: #2563eb;">更小、更快、更贵</strong><br>
                缓存中存放的是底层数据块的子集。
            </div>
        </div>
    </div>

    <div style="text-align: center; margin: 15px 0;">
        <div style="font-size: 2rem; color: #cbd5e1; font-weight: 300; display: inline-block; transform: scaleY(1.5);">↕</div>
    </div>

    <div style="display: flex; align-items: center; justify-content: center;">
        <div style="width: 100%; max-width: 600px; position: relative; background: #f1f5f9; border: 2px solid #64748b; border-radius: 8px; padding: 25px;">
            <div style="position: absolute; left: -100px; top: 50%; transform: translateY(-50%); font-weight: 900; color: #64748b; font-size: 1.2rem; transform: rotate(-90deg);">MEMORY</div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">0</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">1</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">2</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">3</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">4</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">5</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">6</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">7</div>
                <div style="background: #dbeafe; border: 2px solid #3b82f6; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 2px;">8</div>
                <div style="background: #dbeafe; border: 2px solid #3b82f6; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 2px;">9</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">10</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">11</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">12</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">13</div>
                <div style="background: #dbeafe; border: 2px solid #3b82f6; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 2px;">14</div>
                <div style="background: #fff; border: 1px solid #94a3b8; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border-radius: 2px;">15</div>
            </div>
            
            <div style="text-align: center; margin-top: 12px; letter-spacing: 4px; color: #94a3b8; font-weight: bold;">● ● ●</div>

            <div style="position: absolute; right: -240px; top: 50%; transform: translateY(-50%); width: 210px; font-size: 0.8rem; color: #475569; line-height: 1.4;">
                <strong style="color: #475569;">更大、更慢、更便宜</strong><br>
                主存被逻辑上划分为固定大小的“块（Blocks）”。
            </div>
        </div>
    </div>
</div>
（右上角的3也应该标注为蓝色）

- 以这张图为例，数据将以~={yellow}**块**=~大小为传输单位在内存和高速缓存之间传输

### Hit: 命中

1. 假设CPU需要某个块中的数据（比如14）
	- 现在缓存内有这个块，因此可以直接返回——我们称之为~={red}**缓存命中**=~（cache hit）
	- ~={green}THIS IS GOOD!=~
	- 相比于去主存中找，直接在缓存中找到的速度快很多

2. 相反的情况：~={blue}**缓存不命中**=~（cache miss）
	- 比如CPU需要12
	- 但在缓存中查无此项
		- 只好去主存中取出第12块
		- 复制到高速缓存中
		- 然后返回给CPU

### Types of Cache Misses

- ~={red}**Cold miss**=~ / Compulsory miss
	- Cold misses occur because the cache is empty
	- 数据第一次被访问，这是不可避免的

- ~={red}**Conflict miss**=~
	- Most caches limit blocks at level $k+1$ to a small subset (sometimes a singleton) of the block positions at level $k$
		- E.g., Block i at level k+1 must be placed in block (i mod 4) at level k
			- 上例属于~={cyan}映射算法=~
	- Conflict misses occur when the level k cache is large enough, but multiple data objects all map to the same level k block
		- E.g., Referencing blocks 0, 8, 0, 8, 0, 8, ... would miss every time

	- 这时往往可以说：缓存明明还没满！

- ~={red}**Capacity miss**=~
	- Occurs when the set of active cache blocks (working set) is larger than the cache