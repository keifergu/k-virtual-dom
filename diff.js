var REPLACE = 0;	// Node替换
var REORDER = 1;	// 字节点的顺序重排
var PROPS	= 3;		// Node属性的更改
var TEXT = 4;			// NodeString的更改

/**
 * diff 算法
 * @param  {Object|VTree} oldTree 旧的虚拟DOM树
 * @param  {Object|VTree} newTree 新的虚拟DOM树	
 * @return {Object|Patches}       返回一个Patch对象
 *         				Patches:{
 *             			{index: [{type: REPLACE|REORDER|PROPS|TEXT，
 *             				node|moves|props|content}]}
 *         				}
 */
function diff(oldTree, newTree) {
	var index = 0;  	// 从树的顶点开始，深度优先搜索，index为每一个字节点的编号
	var patches = {};	// 总的patches，所有的子patch均放在这里面
	dfsWalk(oldTree, newTree, index, patches); // 深度优先，节点比较
	return patches;
}

function dfsWalk(oldNode, newNode, index, patches) {
	var currentPatch = [];

	// 
	if (newNode === null) {

	} else if (typeof oldNode == 'string' && typeof newNode == 'string') {
		// 此时新旧节点均为string，说明应该为字符串比较
		if (newNode !== oldNode) {
			currentPatch.push({type: TEXT, content: newNode});
		}
	} else if ( // 此时节点不为字符串，说明为普通节点，对key和tagName进行比较
			oldNode.tagName === newNode.tagName &&
			oldNode.key === newNode.key) {

		// 此时，tagName 和 key 相同，进行属性比较，然后递归的进行字节点比较
		var propsPatches = diffProps(oldNode, newNode);
		if (propsPatches) {
			// 存在不相同或新增、减少的属性
			currentPatch.push({type: PROPS, props: propsPatches});
		}
		// 递归对字节点进行diff
		diffChildren(oldNode.children, newNode.children, index, patches, currentPatch);

	} else {
		// 此时两个节点既不为字符串，tagName 和 key 也不想等，说明节点被替换了
		currentPatch.push({type: REPLACE, node: newNode});
	}

	// 如果 currentPatch 为空数组。则此处长度为0,布尔值为false
	// 不为空，则新旧节点存在着不同之处，放入总patches里面
	if (currentPatch.length) {
		patches[index] = currentPatch;
	}
}

/**
 * 对字节点进行深度优先的递归，计算当前节点的序号
 * @param  {Object|VTree} oldChildren  旧的虚拟DOM树
 * @param  {Object|VTree} newChildren  新的虚拟DOM树
 * @param  {Number} 			index        当前节点的序号
 * @param  {Patches} 			patches      总的patches的引用地址
 * @param  {Patches} 			currentPatch 当前patch
 */
function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
	var currentNodeIndex = index;
	var leftNode = null;

	oldChildren.forEach(function(child, i) {
		var newChild = newChildren[i];
		// 当前的oldChild的index，在patches中的键，按照深度优先顺序排列
		// 第一步： 检查 leftNode 的值，为 false 则此时为当前节点数组的第一个node
		//  			 为 true，则说明前面有 node，
		//  			 此时再检查 node.count ，若为 0 ，则说明前一个 node 是字符串
		currentNodeIndex = (leftNode && leftNode.count)
			// 前面的 node 为 element
			? currentNodeIndex + leftNode.count + 1
			// 前面的 node 不存在或者为字符串
			: currentNodeIndex + 1;
		// 递归的对当前节点进行比较
		dfsWalk(child, newChild, currentNodeIndex, patches);
		// 此时将leftNode 设置为当前的child，那么下一次循环中leftNode值就会改变为该值
		// 序号的深度优先排列就是这么来的
		leftNode = child;
	})
}

/**
 * 属性的diff算法
 * @param  {VTree} oldNode 旧的虚拟DOM树
 * @param  {VTree} newNode 新的虚拟DOM树
 * @return {Patches}
 */
function diffProps(oldNode, newNode) {
	var count = 0; 
	var oldProps = oldNode.props;
	var newProps = newNode.props;

	var propsPatches = {};
	var key, value;
	
	// 检查所有旧节点属性，新节点是否改变了该属性值或删掉了该属性
	for(key in oldProps) {
		value = oldProps[key];
		if (newProps[key] !== value) {
			count++;
			propsPatches[key] = newProps[key];
		}
	}
	// 检查新节点属性中，是否有旧节点没有的属性
	for(key in newProps) {
		value = newProps[key];
		if (!oldProps.hasOwnProperty(key)) {
			count++;
			propsPatches[key] = newProps[key];
		}
	}
	// 比较结果为0,全部相同
	if (count === 0) {
		return null;
	}
	return propsPatches;
}

module.exports = diff;