var REPLACE = 0;
var REORDER = 1;
var PROPS	= 3;
var TEXT = 4;
/**
 * 对实际的dom树进行更新
 * @param  {Node}   node    实际的Dom树或节点
 * @param  {Object} patches 由diff算法获得的patch对象
 * @return {[type]}         
 */
function patch(node, patches) {
	// 此处使用对象是因为：对象是传引用，函数中的数值操作会反映在外部
	var walker = {index: 0};
	dfsWalk(node, walker, patches);
}

function dfsWalk(node, walker, patches) {
	var currentPatches = patches[walker.index];

	// node.childNodes 和 node.children 的区别
	// 获得当前node的字节点数
	var len = node.childNodes
		? node.childNodes.length : 0;
	for (var i = 0; i < len; i++) {
		var child = node.childNodes[i];
		walker.index++;
		dfsWalk(child, walker, patches);
	}
	
	// 如果当前节点的patch存在，则应用
	if (currentPatches) {
		applyPatches(node, currentPatches);
	}
}

function applyPatches(node, currentPatches) {
	currentPatches.forEach(function(currentPatch) {
		switch(currentPatch.type) {
			case REPLACE:
				var newNode = (typeof currentPatch.node === 'string')
				  ? document.createTextNode(currentPatch.node)
				  : currentPatch.node.render()
				node.parentNode.replaceChild(newNode, node)
				break;
			/*case REORDER:
				reorderChildren(node, currentPatch.moves);
        break;*/
      case PROPS:
      	setProps(node, currentPatch.props);
      	break;
      case TEXT:
      	if (node.textContent) {
          node.textContent = currentPatch.content
        }
        break;
      default:
      	throw("type error");
		}
	});
}

function setProps(node, props) {
  for (var key in props) {
    if (props[key] ===  undefined) {
      node.removeAttribute(key)
    } else {
      var value = props[key]
      node.setAttribute(key, value);
    }
  }
}

module.exports = patch