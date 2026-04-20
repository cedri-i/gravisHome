---
title: "Lecture 12"
---

# Cache Memories

- Cache memories are small, fast SRAM-based memories maneged automatically in hardware
- Hold frequently accessed blocks
- CPU looks first for data in cache

# S, E, B

<div style="font-family: sans-serif; background-color: white; padding: 20px; border-radius: 8px; color: #333; zoom: 0.8;">
    
    <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 25px;">
        General Cache Organization (S, E, B)
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; position: relative;">

        <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
            E = 2<sup>e</sup> lines per set
        </div>

        <div style="display: flex; position: relative;">

            <div style="display: flex; align-items: center; margin-right: 15px; border-left: 2px solid #555; padding-left: 10px; font-weight: bold;">
                S = 2<sup>s</sup> sets
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">

                <div style="background-color: #E6E6FA; padding: 8px; display: flex; align-items: center; gap: 8px; position: relative;">
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="letter-spacing: 2px; font-weight: bold;">...</div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>

                    <div style="position: absolute; left: 102%; white-space: nowrap; font-size: 13px; color: #6A5ACD;">
                        &larr; set <br>
                        <span style="position: relative; top: 10px;">&larr; line</span>
                    </div>
                </div>

                <div style="background-color: #E6E6FA; padding: 8px; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="letter-spacing: 2px; font-weight: bold;">...</div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                </div>

                <div style="background-color: #E6E6FA; padding: 8px; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="letter-spacing: 2px; font-weight: bold;">...</div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                </div>

                <div style="text-align: center; line-height: 10px; padding: 5px 0; font-weight: bold; letter-spacing: 4px;">
                    ...........................
                </div>

                <div style="background-color: #E6E6FA; padding: 8px; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                    <div style="letter-spacing: 2px; font-weight: bold;">...</div>
                    <div style="width: 60px; height: 25px; border: 1.5px solid #333; background-color: #B0C4DE;"></div>
                </div>
            </div>
        </div>
    </div>

</div>

- 图中标得不精准，应为 $S=2^{s}$ sets
- 每一个 set 有 E 个行
- 每一行由一个 $B=2^b$ 字节的数据块组成

  - 数据块中存在一个~={cyan}有效位=~（valid bit）
  - 它指示这些数据位和数据块实际上是存在的（有意义的）

- 故~={red}**Cache Size**=~: $C=S\times E\times B$
  - 指的是块中包含的数据字节数

## Cache Read

1. 程序访问内存（也即程序执行访存指令）
   - 这引用了主存中的一些 word
2. CPU 将该 word 的地址发送到缓存
3. 要求缓存返回位于该地址的 word
4. Cache 取得这个地址
   - 对于 x86-64 是个 64 位的地址
5. 它将地址划分为多个区域
   - Which are determined by the organization of the cache

<div style="background-color: white; padding: 20px; border-radius: 8px; width: fit-content; font-family: sans-serif; color: black; zoom: 1.2;">
    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">Address of word:</div>
    
    <svg width="420" height="120" viewBox="0 0 420 120">
        <rect x="10" y="5" width="140" height="40" fill="#F8B1A5" stroke="black" stroke-width="2"/>
        <text x="80" y="32" font-size="16" font-weight="bold" text-anchor="middle">t bits</text>
        
        <rect x="150" y="5" width="110" height="40" fill="white" stroke="black" stroke-width="2"/>
        <text x="205" y="32" font-size="16" font-weight="bold" text-anchor="middle">s bits</text>
        
        <rect x="260" y="5" width="90" height="40" fill="white" stroke="black" stroke-width="2"/>
        <text x="305" y="32" font-size="16" font-weight="bold" text-anchor="middle">b bits</text>

        <path d="M 15 55 Q 15 65 80 65 Q 145 65 145 55" fill="none" stroke="black" stroke-width="2"/>
        <text x="80" y="90" font-size="18" text-anchor="middle">tag</text>

        <path d="M 155 55 Q 155 65 205 65 Q 255 65 255 55" fill="none" stroke="black" stroke-width="2"/>
        <text x="205" y="90" font-size="18" text-anchor="middle">set</text>
        <text x="205" y="110" font-size="18" text-anchor="middle">index</text>

        <path d="M 265 55 Q 265 65 305 65 Q 345 65 345 55" fill="none" stroke="black" stroke-width="2"/>
        <text x="305" y="90" font-size="18" text-anchor="middle">block</text>
        <text x="305" y="110" font-size="18" text-anchor="middle">offset</text>
    </svg>

</div>

6. ~={yellow}**b**=~ 个低位地址用于确定块中的偏移量
   - 具体解释：Block Offset 意为~={orange}**块内偏移**=~，决定了在缓存块中**具体要找哪一个字节**
7. 接下来 ~={yellow}**s**=~ 位被视为无符号整数
   - 它作为组的数组的索引
8. 所有剩余的 ~={yellow}**t**=~ 位构成了~={cyan}**标签位**=~
   - 有助于我们的搜索

### 一些理解

- 这个地址是由 CPU 产生的
- 如果它直接去内存拿数据，实在太慢
- 所以选择去 Cache 拿
  - 这就产生了缓存命中/不命中的问题
    - ~={blue}_只要发生缓存行的替换（或称覆盖），Tag 一定会改变_=~
- 而 Cache 已经从内存中取得一些常用数据
  - （很有可能）已经拆解过这个地址
  - 再一次拆解相同的地址，必定指向 Cache 中相同位置
  - 这体现了~={cyan}Hash=~的精髓

#### 逻辑链条

$$地址 \rightarrow Index \rightarrow 找到特定的 Set \rightarrow 检查该 Set 内所有 Line 的 Tag \rightarrow 匹配成功 \rightarrow 根据 Offset 取出数据$$

## E-way Set Associative Cache (Here: E = 2)

E = 2: Two lines per set
Assume: cache block size 8 bytes

<div style="font-family: 'Cascadia Code', 'Fira Code', 'Courier New', monospace; display: flex; flex-direction: column; gap: 15px; color: #000;">

  <div style="display: flex; align-items: center; gap: 15px;">
    <span style="font-size: 0.85em; font-weight: bold; width: 60px; color: #333;">Set 0</span>
    <div style="display: flex; gap: 20px; background-color: #d1d1ff; padding: 12px; border-radius: 4px; border: 1px solid #999;">
      
      <div style="display: flex; border: 2px solid #000; background: #fff; align-items: stretch;">
        <div style="border-right: 2px solid #000; padding: 4px 10px; background: #f0f0f0; display: flex; align-items: center;">v</div>
        <div style="border-right: 2px solid #000; padding: 4px 15px; font-weight: bold; display: flex; align-items: center;">tag</div>
        <div style="display: flex;">
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">0</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">1</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">2</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">3</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">4</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">5</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">6</div>
          <div style="padding: 4px 8px;">7</div>
        </div>
      </div>

      <div style="display: flex; border: 2px solid #000; background: #fff; align-items: stretch;">
        <div style="border-right: 2px solid #000; padding: 4px 10px; background: #f0f0f0; display: flex; align-items: center;">v</div>
        <div style="border-right: 2px solid #000; padding: 4px 15px; font-weight: bold; display: flex; align-items: center;">tag</div>
        <div style="display: flex;">
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">0</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">1</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">2</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">3</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">4</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">5</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">6</div>
          <div style="padding: 4px 8px;">7</div>
        </div>
      </div>

    </div>

  </div>

  <div style="padding-left: 100px; font-size: 24px; letter-spacing: 10px; color: #888;">......</div>

  <div style="display: flex; align-items: center; gap: 15px;">
    <span style="font-size: 0.85em; font-weight: bold; width: 60px; color: #333;">Set S-1</span>
    <div style="display: flex; gap: 20px; background-color: #d1d1ff; padding: 12px; border-radius: 4px; border: 1px solid #999;">
      <div style="display: flex; border: 2px solid #000; background: #fff; align-items: stretch;">
        <div style="border-right: 2px solid #000; padding: 4px 10px; background: #f0f0f0; display: flex; align-items: center;">v</div>
        <div style="border-right: 2px solid #000; padding: 4px 15px; font-weight: bold; display: flex; align-items: center;">tag</div>
        <div style="display: flex;">
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">0</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">1</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">2</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">3</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">4</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">5</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">6</div>
          <div style="padding: 4px 8px;">7</div>
        </div>
      </div>
      <div style="display: flex; border: 2px solid #000; background: #fff; align-items: stretch;">
        <div style="border-right: 2px solid #000; padding: 4px 10px; background: #f0f0f0; display: flex; align-items: center;">v</div>
        <div style="border-right: 2px solid #000; padding: 4px 15px; font-weight: bold; display: flex; align-items: center;">tag</div>
        <div style="display: flex;">
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">0</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">1</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">2</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">3</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">4</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">5</div>
          <div style="padding: 4px 8px; border-right: 1px solid #ccc;">6</div>
          <div style="padding: 4px 8px;">7</div>
        </div>
      </div>
    </div>
  </div>
</div>

- $v$ 位是整行（也即该数据块）共用的
  - 从内存加载数据到缓存时，会~={green}一次性填满=~这 8 个字节
  - 故该行数据
    1. 要么是刚从内存搬过来的有效数据 $-> v=1$
    2. 要么是初始状态或作废的无效数据 $->v=0$

### 为什么需要~={cyan}更高的 $E$ 值=~？（即提高缓存的关联度）

#### 核心目的：~={red}降低冲突不命中=~（Conflict Misses）

1. 减少“抖动”（Thrashing）
   若 $E=1$，~={cyan}内存中的多个块会映射到同一个缓存行=~。假如程序正好在循环访问这两个地址，缓存就会发生“抖动”：

   - 访问 A：载入 A，踢出旧数据
   - 访问 B：载入 B，踢出 A
   - 下一次访问 A：重新载入 A，踢出 B

2. 适应复杂的内存访问模式

3. 提高有效容量（Effective Capacity）
   并未增加缓存的总存储空间而提高了==空间利用率==
   - 增加 $E$ 值平衡了各组之间的压力，使得缓存的每一行都能更有效地工作

### 替换策略 Replacement Policy

- 在一个 Set 有多个 Line/Way 的情况下，硬件的处理逻辑分为~={cyan}**寻找空位**=~和~={blue}**腾出空位**=~两个阶段
  - 第二阶段并非必然发生

1. 如果 Set 内还有空位（$v=0$)
   - 新数据直接存入这一行，将 $v$ 置 1，填入 Tag 和数据
2. 如果数据已满（所有行 $v=1$）
   硬件需要决定覆盖哪一行
   - LRU (Least Recently Used)：最常用
   - FIFO (First In First Out)
   - Random：在高路数的缓存中效果反而不错且电路简单

### 写策略 Write Policy

#### 写回策略 Write-back Policy

- 当新的数据进来踢走旧数据时，如果该旧数据在缓存期间被 CPU 修改过，那么我们必须把修改后的结果同步回内存，也即~={cyan}**Write-back**=~

- 为实现该功能，硬件在原有 $v$ 位和 $tag$ 位之外又增加了一个位：Dirty Bit（脏位）
  - Dirty Bit = 0：数据干净，与内存一致，被覆盖时直接扔掉即可
  - Dirty Bit = 1：数据是脏的，被 CPU 改过，被覆盖时出发写回逻辑：先将数据存回内存地址再存入新数据

#### 两种主要的写策略对比

| **策略**                               | **做法**                                           | **优缺点**                                                                           |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **~={purple}写直达=~ (Write-through)** | 只要 CPU 改了缓存，立刻同步改内存                  | **优点**：内存永远是最新的。**缺点**：太慢了，每次都要等内存写入完成，浪费总线带宽   |
| **~={pink}写回=~ (Write-back)**        | **平时只改缓存**，只有当这一行要被踢出时才写回内存 | **优点**：极快，减少了大量无意义的内存写入。**缺点**：逻辑复杂（需要维护 Dirty bit） |

#### Write-Miss 时的写策略

**写未命中 (Write Miss)** 指的是：当 CPU 尝试向某个内存地址**写入数据**时，发现该地址对应的数据块~={red}**不在缓存 (Cache) 中**=~

##### Write-allocate

- 先将缺失的数据从主存加载到 Cache 中再改
- 通常和~={yellow}写回策略=~搭配使用

##### No-write-allocate

- 不把数据库加载到 Cache，直接把要更新的数据发送的主存（或者下一级缓存）进行修改
- 通常和~={yellow}写直达策略=~搭配使用

| **场景**                  | **核心矛盾**           | **硬件动作**                                                 |
| ------------------------- | ---------------------- | ------------------------------------------------------------ |
| **读未命中 (Read Miss)**  | 没数据可用，CPU 必须等 | 必须从内存加载到 Cache，然后给 CPU                           |
| **写未命中 (Write Miss)** | 没地方存新值           | 可以选择加载到 Cache（写分配），也可以直接写内存（非写分配） |

# Intel Core i7 Cache Hierarchy

- 此前我们假设在一个真实的系统中只有一个 Cache
- 但在实际的系统中是多个 Cache

<div class="processor-package" style="
    font-family: inter, 'Microsoft YaHei', sans-serif;
    border: 2px dashed #333;
    background-color: #e8f5e9;
    padding: 20px;
    width: fit-content;
    margin: 20px auto;
    border-radius: 8px;
    color: #000; /* 确保全局字体颜色为黑色 */
">
    <div class="package-title" style="
        font-weight: bold;
        font-size: 1.2em;
        margin-bottom: 20px;
        color: #000;
    ">Processor package</div>

    <div class="cores-container" style="
        display: flex;
        align-items: flex-start;
        gap: 30px;
        margin-bottom: 30px;
    ">
        <div class="core-box" style="
            background-color: #fff8e1;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 15px;
            width: 220px;
        ">
            <div class="core-title" style="font-weight: bold; margin-bottom: 15px; color: #000;">Core 0</div>
            
            <div class="node regs" style="border: 1px solid #333; background: #fff; padding: 5px; width: 100px; margin: 0 auto 10px; font-weight: bold; color: #000;">Regs</div>
            <div class="line" style="border-left: 1px solid #000; height: 15px; width: 0; margin: 0 auto 5px;"></div>

            <div class="l1-container" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                <div class="node l1-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 5px; width: 90px; color: #000;">L1<br>d-cache</div>
                <div class="node l1-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 5px; width: 90px; color: #000;">L1<br>i-cache</div>
            </div>
            
            <div class="l1-to-l2-lines" style="position: relative; height: 15px;">
                <div style="position: absolute; border-left: 1px solid #000; height: 15px; left: 55px;"></div>
                <div style="position: absolute; border-left: 1px solid #000; height: 15px; right: 55px;"></div>
            </div>

            <div class="node l2-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 8px; width: 190px; margin: 0 auto; color: #000;">L2 unified cache</div>
        </div>

        <div class="dots" style="font-size: 2em; font-weight: bold; align-self: center; color: #000;">. . .</div>

        <div class="core-box" style="
            background-color: #fff8e1;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 15px;
            width: 220px;
        ">
            <div class="core-title" style="font-weight: bold; margin-bottom: 15px; color: #000;">Core 3</div>
            
            <div class="node regs" style="border: 1px solid #333; background: #fff; padding: 5px; width: 100px; margin: 0 auto 10px; font-weight: bold; color: #000;">Regs</div>
            <div class="line" style="border-left: 1px solid #000; height: 15px; width: 0; margin: 0 auto 5px;"></div>

            <div class="l1-container" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                <div class="node l1-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 5px; width: 90px; color: #000;">L1<br>d-cache</div>
                <div class="node l1-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 5px; width: 90px; color: #000;">L1<br>i-cache</div>
            </div>
            
            <div class="l1-to-l2-lines" style="position: relative; height: 15px;">
                <div style="position: absolute; border-left: 1px solid #000; height: 15px; left: 55px;"></div>
                <div style="position: absolute; border-left: 1px solid #000; height: 15px; right: 55px;"></div>
            </div>

            <div class="node l2-cache" style="border: 1px solid #333; background: #e3f2fd; padding: 8px; width: 190px; margin: 0 auto; color: #000;">L2 unified cache</div>
        </div>
    </div>

    <div class="l2-to-l3-lines" style="position: relative; height: 20px; margin-bottom: 5px; margin-left: auto; margin-right: auto; width: calc(100% - 130px);">
        <div style="position: absolute; border-left: 1px solid #000; height: 20px; left: 110px;"></div>
        <div style="position: absolute; border-left: 1px solid #000; height: 20px; right: 110px;"></div>
    </div>

    <div class="node l3-cache" style="
        border: 2px solid #333;
        background: #e3f2fd;
        padding: 15px;
        width: 80%;
        margin: 0 auto;
        font-weight: bold;
        font-size: 1.1em;
        color: #000;
        border-radius: 8px;
    ">L3 unified cache<br>(shared by all cores)</div>

</div>

- 本图同样有不准确之处：
	- Regs 应只连接 d-cache

## ==L1== i-cache and d-cache:
- d-cache: Data Cache
- i-cache: Instruction Cache
- 32KB, 8-way
- Access: 4 cycles

## ==L2== unified cache:
- 256KB, 8-way
- Access: 10 cycles

## ==L3== unified cache:

- 8MB, 16-way
- Access: 40-75 cycles

1. 如果在 L1 中出现未命中，则 L1 感知到。然后尝试向 L2 发送请求以尝试在 L2 中查找数据
2. 如果 L2 也无法找到它，它会向 L3 发送请求，以查看是否可以在 L3 中找到数据
3. 如果 L3 也找不到，只能放弃在芯片内部（on-chip）寻找数据，转而去芯片外的内存里面找，不过这一过程比之前的更复杂

# Cache Performance Metrics

一些衡量缓存的性能的指标
## · ~={cyan}Miss Rate=~

- 未命中率：最常用的
	- 正常情况下必须==非常低==
	- 而由于 Locality，确实很低
- Fraction of memory references not found in cache (misses / accesses) = 1 - hit rate
- Typical numbers (int percentages):
	- 3-10% for L1
	- can be quite small (e.g., < 1%) for L2, depending on size, etc
## · ~={cyan}Hit Time=~

- 命中时间：如果确实命中了，它实际需要多长时间
- Time to deliver a line in the cache to the processor
	- includes time to determine whether the lines is in the cache
- Typical numbers:
	- 4 clock cycle for L1
	- 10 clock cycles for L2
## · ~={cyan}Miss Penalty=~

- 未命中惩罚
- Addtional time required because of a miss
	- typically 50-200 cycles for main memory (Trend: increasing!)

## Let's think about those numbers

- Huge difference between a hit and a miss
	- Could be 100x, if just L1 and main memory

- Would you believe ~={yellow}99% hits is twice as good as 97%=~?
	- Consider:
		cache hit time of 1 cycle miss penalty of 100 cycles
	- 计算一下就知道了
	- 本例证明 Miss Rate 和 Miss Penalty 都很重要，对其很~={purple}**敏感**=~

## Writing Cache Friendly Code

- 不存在所谓的可见指令集，去允许我们操作缓存
- 这一切都由硬件自动执行
### Make the common case go fast
- Focus on the inner loops of the core functions
- 在任何程序中，**90%的执行时间通常只花在10%的代码上**

### Minimize the misses in the inner loops
- Repeated references to variables are good (~={red}temporal locality=~)
- Stride-1 references patterns are good (~={red}spatial locality=~)
	- 步长为1的访问模式
- 这两点可以总结为：保证程序的局部性

# Performance impact of caches

缓存对代码的性能影响
## The Memory Mountain

- ~={red}**Read throughput**=~ (read bandwidth)
	- Number of bytes read from memory per second (MB / s)
	- 吞吐量：单位时间内从内存系统中读取的数据量
- ~={red}**Memory Mountain**=~: Measured read throughput as a function of spatial and temporal locality
	- Compact way to characterize mamory system performance

### Memory Mountain Test Function

```C
/* 定义一个全局大数组，确保它能撑满 L3 甚至超出到内存 */
long data[MAXELEMS]; 

/**
 * @brief 内存性能测试函数
 * @param elems  参与测试的元素总数（控制时间局部性/工作集大小）
 * @param stride 访问步长（控制空间局部性）
 */
int test(int elems, int stride) {
    long i;
    // 预计算步长的倍数，进一步优化性能
    long sx2 = stride * 2, sx3 = stride * 3, sx4 = stride * 4;
    long acc0 = 0, acc1 = 0, acc2 = 0, acc3 = 0;
    long length = elems;
    long limit = length - sx4;

    /* 核心测试循环：4x4 循环展开 */
    for (i = 0; i < limit; i += sx4) {
        acc0 = acc0 + data[i];
        acc1 = acc1 + data[i + stride];
        acc2 = acc2 + data[i + sx2];
        acc3 = acc3 + data[i + sx3];
    }

    /* 处理剩余的元素（收尾工作） */
    for (; i < length; i++) {
        acc0 = acc0 + data[i];
    }

    /* 返回所有结果之和，防止编译器将循环整个优化掉 */
    return ((acc0 + acc1) + (acc2 + acc3));
}
```

- 步长达到 block 大小时，spatial locality ~={orange}不再对性能有增益效果=~
	- 理由：空间局部性的优点在于“顺便带回来的数据”有很大可能随后被使用
	- 但如果步长达到一个 block，那么后面的数据就会被跳过，是否额外带数据回来于性能不再有意义
	- 所以需要步长~={cyan}尽可能小=~

## Rearranging loops to improve spatial locality

### Matrix Multiplication Example

```C
for (i = 0; i < n; i++) {
	for (j = 0; j < n; j++) {
		sum = 0.0; // variable held in register
		for (k = 0; k < n; k++)
			sum += a[i][k] * b[k][j];
		c[i][j] = sum;
	}
}
```

### Summary of Matrix Multiplication

#### 1. ijk (& jik):
```C
for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
        sum = 0.0;
        for (k = 0; k < n; k++) {
            sum += a[i][k] * b[k][j];
        }
        c[i][j] = sum;
    }
}
```
- 2 loads, 0stores
- misses/iter = ~={yellow}**1.25**=~
#### 2. kij (& ikj):
```C
for (k = 0; k < n; k++) {
    for (i = 0; i < n; i++) {
        r = a[i][k]; // 将 a[i][k] 提出来作为常数，利用时间局部性
        for (j = 0; j < n; j++) {
            c[i][j] += r * b[k][j];
        }
    }
}
```
- 2 loads, 1 store
- misses/iter = ~={green}**0.5**=~
#### jki (& kij):
```C
for (j = 0; j < n; j++) {
    for (k = 0; k < n; k++) {
        r = b[k][j];
        for (i = 0; i < n; i++) {
            c[i][j] += a[i][k] * r;
        }
    }
}
```
- 2 loads, 1 store
- misses/iter = ~={red}**2.0**=~

## Using blocking to improve temporal locality

blocking：分块

> 这里有些笔记未记录……

