---
title: "SQL 专用笔记"
---

该笔记的唯一目的是便利Week7的学习
> SQL主要运行在==**资料库管理系统**==
## `SELECT`
### 关键字顺序

|        关键字 | 中文   |
| ---------: | ---- |
|   `SELECT` | 选取   |
|     `FROM` | 来源   |
|    `WHERE` | 条件   |
| `GROUP BY` | 分组   |
|   `HAVING` | 条件   |
| `ORDER BY` | 顺序   |
|    `LIMIT` | 笔数限制 |
#### 网站：Sqliteviz
- 注释
	- 单行：`--`
	- 多行：`/* */`
```SQL
SELECT * FROM "students";
```
SELECT表示选取，\*指全部，后面是“从students表格查询“之意
- 是否使用双引号取决于具体的资料库软体
- 加上`;`是良好的编程习惯，尽管有些资料库软体允许省略
按下`Ctrl + Enter`，底部视窗即显示表格资料
如不需要所有栏位：
```SQL
SELECT 姓名, 班级, 成绩 FROM students LIMIT 5;
```
`LIMIT`语法用于限制查询结果的“笔数”*——台湾教程的译法*
如果要接着看：
```SQL
SELECT 姓名, 班级, 成绩 FROM students LIMIT 5 OFFSET 5;
```
意思是跳过前5笔，看第6-10笔
> 可以将关键字分行，以看得更清楚
### `Where`语法
```SQL
SELECT 姓名, 班级, 成绩
FROM students
WHERE 班级 = '1年2班' -- 使用单引号！
ORDER BY 班级, 成绩 DESC;
```
- `WHERE`也可以作比对：
	`WHERE 成绩 >= 80 AND 成绩 < 90;`
	- 简写版：
		`WHERE 成绩 BETWEEN 80 AND 90;`
- `AND`的优先级高于`OR`
- `WHERE 班级 = '1年1班' OR 班级 = '1年2班';`
	- 简写版：
		`WHERE 班级 IN ('1年1班', '1年2班')`
#### `SQL`的不等于是==`<>`==，特别注意！
- 输入`DESC`可以将排序改为*降序*（由高到低）
***
### 模糊搜索
```SQL
SELECT 姓名, 班级, 成绩
FROM students
WHERE 姓名 LIKE '张%'
```
#### 万用字元
- `%`表示一个或多个任意字元
- `_`表示一个字元
	- 故如果是`WHERE 姓名 LIKE '张_'`，只会找到“张静”而找不到“张小杰”
### 函数
```SQL
SELECT AVG(成绩)
FROM students;
```
即可查出此次测验全部同学的平均分
```SQL
SELECT AVG, SUM, MAX, MIN, COUNT
```
以上为其他的一些函数
可以为它们设置别名，语法为：
```SQL
SELECT AVG(成绩) AS 平均成绩, MAX(成绩) AS 最高分 
```
### 常用函数之`COUNT`
```SQL
SELECT COUNT(*)
FROM students;
```
- 也可以针对单一栏位进行计数：
```SQL
SELECT COUNT(成绩)
FROM students;
```
- 但这两个结果**可能不同**，因为`COUNT`在对单一栏位计数时，会自动忽略空白的储存格
- 使用`DISTINCT`排除表格中重复的资料：
```SQL
SELECT COUNT(DISTINCT 成绩)
FROM students;
```
- 这样做可以知道某项数据的==种数==
- 也可以拿掉`COUNT`而只使用`DISTINCT`，可以知道具体有哪些：
```SQL
SELECT DISTINCT 成绩
FROM students
WHERE 成绩 IS NOT NULL
ORDER BY 成绩;
```
- 但须注意，`DISTINCT`~={yellow}不会自动排除`NULL`=~
### `ROUND`语法
```SQL
SELECT ROUND(AVG(成绩), 1)
FROM students;
```
- 可以决定要保留的小数位数
- 如果要四舍五入到整数：
	直接`ROUND(AVG(成绩))`即可，省略后面的数字
### `GROUP BY`语法
```SQL
SELECT 班级, ROUND(AVG(成绩), 1) AS 平均成绩
FROM students
GROUP BY 班级
HAVING 平均成绩 >= 80
ORDER BY 平均成绩 DESC;
```
此时要做筛选必须用`HAVING`语句
## `CREATE`
```SQL
CREATE TABLE clubs (
社团编号 INT,
社团名称 VARCHAR(15)
);
```
- 圆括号内指定表格有哪些栏位
- 指定各个栏位的==数据类型==
	- 进一步指定字数上限
### Primary Key主键
其功能为识别每一笔资料
如：

| 商品ID | 商品名称 | 售价  |
| :--: | ---- | --- |
|      |      |     |
此时商品ID为主键
- 主键不能有重复数值
- 主键不能为`NULL`
```SQL
CREATE TABLE clubs (
社团编号 INT PRIMARY KEY,
社团名称 VARCHAR(15)
);
```
## `DELETE`
### `DROP`
```SQL
DROP TABLE clubs2;
```
## `INSERT`
```SQL
INSERT INTO clubs (社团编号, 社团名称)
VALUES (101, '吉他社'), (102, '篮球社'), (103, '美术社'), (104, 'NULL');

SELECT * FROM clubs;
```
在底下加一行`SELECT`来确认数据有输入进去
## `UPDATE`
```SQL
UPDATE clubs
SET 社团名称 = '舞蹈社';
WHERE 社团编号 = 104;

SELECT * FROM clubs;
```
- 如果不使用`WHERE`指定的话，会导致全部社团的名称都变成舞蹈社
	- 该情形同样适用于`DELETE`语法
## 跨表格查询
```SQL
SELECT students.姓名, students.社团, clubs.社团名称
FROM students
LEFT JOIN clubs
ON students.社团 = clubs.社团编号
WHERE 班级 = '1年1班';
```
- 此时会显示没有没有对应上的数据，而如果将`LEFT JOIN`改为`INNER JOIN`或直接使用`JOIN`则可以把它们隐藏起来，只显示成功对应上的