(function(){
	$(document).ready(function(){
		// 初始化输出大小
		initOutputSize(data);
		createItems(data);
	});
	function createItems(data){
		var i = 0;
		var sequenceCanvasItem;
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			if(key == "bg"){
				var bg_img = val['img'];
				$("#bg_image").attr("src",bg_img + "?rand="+Math.random());
			 }else{
				var img = val['img'];		// 大图片路径(背景图片的路径)
				if(!i){
					$("#bgimg").attr("src",img + "?rand="+Math.random());
					i++;
				}
				var nodeRelPath = "json/data/" + key;
				sequenceCanvasItem = '<div class="content">' +
										'<div>' +
											'<a name="' + nodeRelPath + '" href="' + img + "?rand="+Math.random() + '">' +
											'</a>' + 
										'</div>' +
									'</div>';
				var sequenceCanvas = $(".container");
				if(sequenceCanvas){ 
					sequenceCanvas.append(sequenceCanvasItem);
					
				}else{
					alert('初始化数据时容器不存在！');
				}
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