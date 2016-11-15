var REPLACE = 0;
var REORDER = 1;
var PROPS	= 3;
var TEXT = 4;

function diff(oldTree, newTree) {
	var index = 0;
	var patches = {};
	dfsWalk(oldTree, newTree, index, patches);
	return patches;
}

function dfsWalk(oldNode, newNode, index, patches) {
	var currentPatch = [];

	// 
	if (newNode === null) {

	} else if (typeof oldNode == 'string' && typeof newNode == 'string') {
		// 
		if (newNode !== oldNode) {
			currentPatch.push({type: TEXT, content: newNode});
		}
	} else if (
			oldNode.tagName === newNode.tagName &&
			oldNode.key === newNode.key) {

		var propsPatches = diffProps(oldNode, newNode);
		if (propsPatches) {
			currentPatch.push({type: PROPS, props: propsPatches});
		}

		diffChildren(oldNode.children, newNode.children, index, patches, currentPatch);

	} else {
		currentPatch.push({type: REPLACE, node: newNode});
	}

	// 如果 currentPatch 为空数组。则此处长度为0,布尔值为false
	if (currentPatch.length) {
		patches[index] = currentPatch;
	}
}

function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
	var currentNodeIndex = index;
	var allLeftNode = null;

	oldChildren.forEach(function(child, i) {
		var newChild = newChildren[i];
		// 当前的oldChild的index，在patches中的键，按照深度优先顺序排列
		// 第一步： 检查 allLeftNode 的值，为 false 则此时为第一个node
		//  			 为 true ，则说明前面有 node，
		//  			 		此时再检查 前面 node.count ，为 0 ，则说明面前一个 node 是字符串
		currentNodeIndex = (allLeftNode && allLeftNode.count)
			// 前面的 node 为 element
			? currentNodeIndex + allLeftNode.count + 1
			// 前面的 node 不存在或者为字符串
			: currentNodeIndex + 1;
		dfsWalk(child, newChild, currentNodeIndex, patches);
		allLeftNode = child;
	})
}

function diffProps(oldNode, newNode) {
	var count = 0; 
	var oldProps = oldNode.props;
	var newProps = newNode.props;

	var propsPatches = {};
	var key, value;
	
	for(key in oldProps) {
		value = oldProps[key];
		if (newProps[key] !== value) {
			count++;
			propsPatches[key] = newProps[key];
		}
	}

	for(key in newProps) {
		value = newProps[key];
		if (!oldProps.hasOwnProperty(key)) {
			count++;
			propsPatches[key] = newProps[key];
		}
	}

	if (count === 0) {
		return null;
	}
	return propsPatches;
}

module.exports = diff;