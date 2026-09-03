---
title: "25 Cache II"
description: UCB CS61C 直接映射缓存与缓存术语笔记
---

# Direct-Mapped Cache
- 在~={yellow}直接映射缓存=~中，每个内存地址只能对应缓存中唯一的一个位置
- 这个位置是一个“block”（块）
>对于硬盘，我们移入移出的数据单位是“file”；对于寄存器我们会说“word”；而“block”则用于缓存。
>*Block is the unit of transfer between cache and memory.*
## Address Mapping
对于直接映射缓存：
$$
\boxed{\text{Cache Index}=\text{Memory Block Number}\bmod\text{Number of Cache Lines}}
$$
因此，~={yellow}**多个不同的 Memory Block 可能映射到同一个 Cache Line**=~。在映射到缓存时，这没有什么影响。但如果 Cache 中已经有了数据，我们就不知道它是从哪里来的了。为了解决此问题，我们需要额外保存一个 ~={cyan}**Tag**=~。
这样一来，一个内存地址可以划分为：
$$
\boxed{\text{Tag}\mid\text{Index}\mid\text{Block Offset}}
$$
- **Index**：决定访问哪一个 Cache Line
- **Tag**：判断该 Cache Line 中存放的是否是目标 Memory Block
- **Block Offset**：决定访问 Block 内的哪一个 Byte
	- 当 Block 不止一个 Byte 时我们需要它
## Calculating
下面给出 T, I, O 的计算方法。
假设：
- 地址宽度 = A bits
- Cache 大小 = C Bytes
- Block 大小 = B Bytes

那么：
$$
\text{Offset bits}=\log_2 B
$$
$$
 \text{Cache blocks}=\frac{C}{B}
$$
$$
 \text{Index bits}=\log_2\frac{C}{B}
$$
故：
$$
 \boxed{\text{Tag bits}=A-\text{Index bits}-\text{Offset bits}}
$$
# Cache Temperatures
- Cold
	- Cache empty
- Warming
	- Cache filling with values you'll hopefully be accessing again soon
- Warm
	- Cache is doing its job, fair % of this
- Hot
	- Cache is doing very well, high % of hits
# Cache Terms
- ~={yellow}Hit rate=~: fraction of access that hit in the cache
- ~={yellow}Miss rate=~: 1 - Hit rate
- ~={yellow}Miss penalty=~: time to replace a block from lower level in memory hierarchy to cache
- ~={yellow}Hit time=~: time to access cache memory (including tag comparison)
- Abbreviation: "\$" = cache
	- UCB scholars' innovation
# One more detail: Valid Bit
当开始一个新程序时，缓存肯定没有任何这个程序的有效信息。为了表示这件事，我们引入了一位有效位。
它一旦被设置为 0，这个缓存就必定是冷的。
