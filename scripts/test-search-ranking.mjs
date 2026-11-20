import assert from 'node:assert/strict';
import test from 'node:test';
import { findNotes, prepareIndex } from '../src/lib/notes-search.ts';

const index = prepareIndex([
    {
        title: '更新历史', url: '/updates/', keywords: '',
        sections: [['笔记更新', 'notes', '新增 AVL 旋转示例和 CS61C 缓存笔记。']],
    },
    {
        title: 'AVL Tree', url: '/avl/', keywords: '',
        sections: [['旋转操作', 'rotation', '失衡时做左旋或右旋。']],
    },
    {
        title: '22 Pipelining II', url: '/pipelining/', description: 'CS61C 流水线与数据通路', keywords: '',
        sections: [
            ['2) Data hazard', 'data-hazard', 'Data dependency between instructions.'],
            ['Load Data Hazard', 'load-hazard', '流水线中的加载指令可能引发数据冒险。'],
        ],
    },
    {
        title: '24 Caches I', url: '/caches/', description: 'CS61C 缓存与局部性笔记', keywords: '',
        sections: [['Cache Design', 'cache-design', '如何利用局部性。']],
    },
    {
        title: 'B+ Tree', url: '/b-plus-tree/', keywords: '',
        sections: [['非叶节点', 'branch', '索引到各个分支。']],
    },
    {
        title: 'B-Tree', url: '/b-tree/', keywords: '',
        sections: [['定义', 'definition', 'B 树中的每个节点可以存储多个值。']],
    },
    {
        title: '写给海宁站的短文', url: '/haining/', keywords: '',
        sections: [['', '', '这篇短文写于火车上。']],
    },
    {
        title: 'C', url: '/c/', description: 'C 语言笔记入口', keywords: '', sections: [],
    },
    {
        title: 'CPU Datapath', url: '/cpu/', keywords: '',
        sections: [['Timing', 'timing', 'Let C represent the cycle time.']],
    },
]);

const urls = (query) => findNotes(index, query).map((result) => result.url);

test('matches mixed topic and section queries ahead of incidental mentions', () => {
    assert.equal(urls('AVL 旋转')[0], '/avl/#rotation');
    assert.equal(urls('CS61C 缓存')[0], '/caches/#cache-design');
    assert.equal(urls('流水线数据冒险')[0], '/pipelining/#data-hazard');
    assert.equal(urls('22 pipeline')[0], '/pipelining/');
    assert.equal(urls('21 pipeline').length, 0);
});

test('recognizes Chinese names and variants without conflating technical symbols', () => {
    assert.equal(urls('平衡二叉树')[0], '/avl/');
    assert.equal(urls('B 树')[0], '/b-tree/');
    assert.equal(urls('Ｂ＋ 树')[0], '/b-plus-tree/');
    assert.equal(urls('非叶结点')[0], '/b-plus-tree/#branch');
    assert.deepEqual(urls('C'), ['/c/']);
    assert.deepEqual(urls('C++'), []);
});

test('finds a title when the query omits connecting words', () => {
    assert.equal(urls('海宁站短文')[0], '/haining/');
    assert.deepEqual(urls('不存在的搜索词'), []);
});
