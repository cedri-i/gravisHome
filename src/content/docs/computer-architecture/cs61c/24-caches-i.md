---
title: "24 Caches I"
description: UCB CS61C 缓存与局部性笔记
---

# Binary Prefix
| Name  | Abbr |                                         Factor |                                         SI size |
| ----- | ---- | ---------------------------------------------: | ----------------------------------------------: |
| Kilo  | K    |                             $$2^{10}$$ = 1,024 |                                $$10^3$$ = 1,000 |
| Mega  | M    |                         $$2^{20}$$ = 1,048,576 |                            $$10^6$$ = 1,000,000 |
| Giga  | G    |                     $$2^{30}$$ = 1,073,741,824 |                        $$10^9$$ = 1,000,000,000 |
| Tera  | T    |                 $$2^{40}$$ = 1,099,511,627,776 |                 $$10^{12}$$ = 1,000,000,000,000 |
| Peta  | P    |             $$2^{50}$$ = 1,125,899,906,842,624 |             $$10^{15}$$ = 1,000,000,000,000,000 |
| Exa   | E    |         $$2^{60}$$ = 1,152,921,504,606,846,976 |         $$10^{18}$$ = 1,000,000,000,000,000,000 |
| Zetta | Z    |     $$2^{70}$$ = 1,180,591,620,717,411,303,424 |     $$10^{21}$$ = 1,000,000,000,000,000,000,000 |
| Yotta | Y    | $$2^{80}$$ = 1,208,925,819,614,629,174,706,176 | $$10^{24}$$ = 1,000,000,000,000,000,000,000,000 |
我们购买的硬盘的大小实际上是表格右列，即 10 的幂。
在网络传输中，我们也用 10 的幂，如果我有一个“Gigabit Network”，它就是每秒 10 的 9 次方位。
~={green}网络传输=~和~={yellow}硬盘=~是十进制，而其他所有东西如缓存、内存等都是二进制。
IEC 在 1999 年推出了用于区分的称呼：

|Name|Abbr|Factor|
|---|---|--:|
|kibi|Ki|$$2^{10}$$ = 1,024|
|mebi|Mi|$$2^{20}$$ = 1,048,576|
|gibi|Gi|$$2^{30}$$ = 1,073,741,824|
|tebi|Ti|$$2^{40}$$ = 1,099,511,627,776|
|pebi|Pi|$$2^{50}$$ = 1,125,899,906,842,624|
|exbi|Ei|$$2^{60}$$ = 1,152,921,504,606,846,976|
|zebi|Zi|$$2^{70}$$ = 1,180,591,620,717,411,303,424|
|yobi|Yi|$$2^{80}$$ = 1,208,925,819,614,629,174,706,176|
- *bi* is short for "binary", but pronounced "bee" 
# Library Analogy
- 这是个用于辅助理解缓存的概念的类比

想象一个借阅书籍用于辅助论文写作的场景：我们抱着一大堆书从书架回来，并放在离书架很近的一张大桌子上面一一翻阅。如果这张桌子太小，那么一趟趟来回是很麻烦的，所以我们希望它大一些，且大得适当。
这里产生的概念是：我们希望经常用到的东西离我们近一点。
缓存其实也是这样。
# Memory Caching
- Mismatch between processor and memory speed leads us to add a new level...
	- "memory ~={yellow}cache=~"

BTW，缓存是计算机科学中的一个很大且很重要的概念。
- ~={cyan}**缓存是内存的一个子集的副本**=~
	- 这里它是狭义的，但对于以后可能接触到的广义上的缓存，同样如此
- 它在各方面（如速度、大小、价格）都介于寄存器和内存这两者之间
## The distance of the Data
如果从寄存器取得只需要 1 分钟，那么相应地，从内存取得大致需要 1.5 小时；而介于两者之间地，缓存需要 2 分钟。
# Locality, Design, Management
## Locality
- 缓存的工作原理是~={red}时间局部性=~和~={blue}空间局部性=~
	- 时间局部性：如果用过，那么很有可能很快还会再用
	- 空间局部性：如果使用了一块内存，那么很有可能会用它附近的内存
## Cache Design
- 我们应该如何组织 Cache？
- 每个内存地址应该映射到 Cache 的什么位置？
    - （记住：Cache 只是内存内容的一个子集，因此多个内存地址可能会映射到同一个 Cache 位置）
- 我们如何知道哪些数据当前在 Cache 中？
- 我们如何快速找到它们？
### How is the Hierarchy Managed?
- registers ↔ memory
    - By compiler (or assembly level programmer)
- cache ↔ main memory
    - By the cache controller hardware
- main memory ↔ disks (secondary storage)
    - By the operating system (virtual memory)
    - Virtual to physical address mapping assisted by the hardware (“translation lookaside buffer” or TLB)
    - By the programmer (files)
