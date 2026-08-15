import assert from 'node:assert/strict';

import { remarkLabeledBlockquote } from '../remark-labeled-blockquote.mjs';
import { remarkPreserveParagraphBreaks } from '../remark-preserve-paragraph-breaks.mjs';

const text = (value) => ({ type: 'text', value });
const paragraph = (value) => ({ type: 'paragraph', children: [text(value)] });

const tree = {
    type: 'root',
    children: [
        paragraph('正文第一行\n正文第二行'),
        {
            type: 'blockquote',
            children: [paragraph('[!note]\n引用第一行\n引用第二行')],
        },
        {
            type: 'list',
            ordered: false,
            children: [
                {
                    type: 'listItem',
                    children: [paragraph('列表第一行\n列表第二行')],
                },
            ],
        },
        {
            type: 'code',
            lang: 'text',
            value: '代码第一行\n代码第二行',
        },
        {
            type: 'paragraph',
            children: [
                {
                    type: 'strong',
                    children: [text('加粗第一行\n加粗第二行')],
                },
            ],
        },
    ],
};

remarkLabeledBlockquote()(tree);
remarkPreserveParagraphBreaks()(tree);

const childTypes = (node) => node.children.map((child) => child.type);

assert.deepEqual(
    childTypes(tree.children[0]),
    ['text', 'break', 'text'],
    'root prose newlines must become visible breaks',
);

const quote = tree.children[1];
assert.equal(quote.type, 'blockquote', 'quoted source must remain a blockquote');
assert.deepEqual(quote.data.hProperties.className, ['note-explainer']);
assert.deepEqual(
    childTypes(quote.children[0]),
    ['text', 'break', 'text'],
    'blockquote newlines must become visible breaks',
);

const listParagraph = tree.children[2].children[0].children[0];
assert.deepEqual(
    childTypes(listParagraph),
    ['text', 'break', 'text'],
    'list-item paragraph newlines must become visible breaks',
);

assert.equal(
    tree.children[3].value,
    '代码第一行\n代码第二行',
    'fenced code content must remain untouched',
);

assert.deepEqual(
    childTypes(tree.children[4].children[0]),
    ['text', 'break', 'text'],
    'newlines inside inline formatting must become visible breaks',
);

console.log('Note-format contract passed: line breaks and blockquotes are preserved.');
