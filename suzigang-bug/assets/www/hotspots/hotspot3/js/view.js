(function(){
	$(document).ready(function(){
		var url = window.location.href;
		 window.templatePath = url.substring(0, url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
		initData(function(data){
			initOutputSize(data);
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
		});
	});
	function initData(callback){
		$.getJSON(window.templatePath + ".2.json?r="+Math.random()).done(function(data){
			if(typeof(callback)=='function'){
				callback(data);
			}else{
				alert('initData 回调函数错误');
			}
		}).fail(function(){
			alert("初始化数据失败！展品 edit.js 第40行");
		})
	}
	function createItems(data){
		var i = 0
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			var title = val['title'];	// 图片标题
			var nodeRelPath = "json/data/" + key;	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			var img = val['img'];		// 大图片路径(背景图片的路径)
			if(!i){
				$("#bgimg").attr("src",img);
				$("#bgimg").attr("name",nodeRelPath);
				$("#bgimg").attr("title",title);
				$("#bgimg").attr("alt",title);
				i++;
			}
			var thumbnail = val['thumbnail'];	// 缩略图路径
			sequenceCanvasItem = '<div class="content">' +
									'<div>' +
										'<a href="' + img + '">' +
											'<img src="' + thumbnail + '"' + 'title="' + title +'"'+ 'alt="' + title + '"name="' + nodeRelPath + '" class="thumb" />' +
										'</a>' + 
									'</div>' +
								'</div>';
			var sequenceCanvas = $(".container");
			if(sequenceCanvas){ 
				$(sequenceCanvas).append(sequenceCanvasItem);
				
			}else{
				alert('初始化数据时容器不存在！');
			}
		});
		$.initload();
	}
	function initOutputSize(data){
		var w= data['width'];
		var h = data['height'];
		if(!isNaN(w) && !isNaN(h)){
			$('body').height(h+'px');
			$('body').width(w+'px');
		}else{
			$('body').height("100%");
			$('body').width("100%");
		}
	}

})()