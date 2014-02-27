(function(){
	$(document).ready(function(){
		
		var url = window.location.href;
 		window.templatePath = url.substring(0, url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
		initData(function(data){
			initOutputSize(data);
			// 创建 DOM 节点
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
			alert("初始化数据失败!");
		})
	}
	function createItems(data){
		var i = 0
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			if(key == "bg"){
				var bg_img = val['img'];
				$("#bg_image").attr("src",bg_img+"?rand="+Math.random());
			}else{
				var img = val['img'];		// 大图片路径(背景图片的路径)
				if(!i){
					$("#bgimg").attr("src",img+"?rand="+Math.random());
					i++;
				}
				sequenceCanvasItem = '<div class="content">' +
										'<div>' +
											'<a href="' + img +"?rand="+Math.random() + '">' +
											'</a>' + 
										'</div>' +
									'</div>';
				var sequenceCanvas = $(".container");
				if(sequenceCanvas){ 
					$(sequenceCanvas).append(sequenceCanvasItem);
					
				}else{
					alert('初始化数据时容器不存在！');
				}
			}
		});
		var Img = document.getElementById("bgimg");
		var newImage = new Image();
		newImage.src = Img.src;
		newImage.onload = function(){
			var width = $("#bgimg").width();
			var height = $("#bgimg").height();
			if(width && height){
				$.initload();
				$("#bgimg").css("display","block");
			}
		}
		
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
})();