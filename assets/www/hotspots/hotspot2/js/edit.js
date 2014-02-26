(function(){
	$(document).ready(function(){
		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
		initData(function(data){
			initOutputSize(data);
			// 创建 DOM 节点
			createItems(data);
			//绑定事件
			bindEditEvent();
			//初始化对话框
			initDialog();
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
				$("#bg_image").attr("src",bg_img + "?rand="+Math.random());
			}else{
				var nodeRelPath = "json/data/" + key;	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
				var img = val['img'];		// 大图片路径(背景图片的路径)
				if(!i){
					$("#bgimg").attr("src",img+"?rand="+Math.random());
					$("#bgimg").attr("name",nodeRelPath);
					i++;
				}
				sequenceCanvasItem = '<div class="content">' +
										'<div>' +
											'<a name="' + nodeRelPath + '" href="' + img + "?rand="+Math.random() + '">' +
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
	function bindEditEvent()
	{
		//给图片监听点击事件
		$("#bgimg").click(function(event){
			// 弹出修改图片的UI
			showChangePictureUI($(this));	
		});
	}
	// 更换图片的UI
	function showChangePictureUI(imgDom)
	{
		
		// 清空form
		$( "#dialog-form").empty();
		// 修改当前轮播项数据所使用的图片路径
		var nodeRelPath = $(imgDom).attr('name');
		if(!nodeRelPath){
			alert('初始化节点时没有设置 nodeRelPath !');
			return;
		}
		// 获取图片地址的存放路径 json/data/key/img
		var dataNodeName = nodeRelPath+'/img';
		var oldPicFile = "images/" + $(imgDom).attr('src').split("images/")[1].split("?rand=")[0];
		var data = {
		};
		var schema = {
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'filePic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':30
	            }
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formChangePicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			//'<input type="hidden" id="picjsonDel" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitPicture">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
				'<button id="btnDeletePicture"> 删除此图片 </button>' +
				'<br /><br /><br /><br /><hr /><br />' + 
				'<button id="btnAddPicFront">添加图片</button>&nbsp;&nbsp;' +
				'<button id="btnCheckBgPic">更换背景图片</button>&nbsp;&nbsp;' +
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','200px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnAddPicFront').button( { icons: { primary: "ui-icon-seek-prev" } } );
		$('#btnCheckBgPic').button( { icons: { primary: "ui-icon-seek-next" } } );
		$('#btnDeletePicture').button( { icons: { primary: "ui-icon-closethick" } } );

		// 点击修改图片的提交按钮
		$('#btnSubmitPicture').click(function(){
			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#filePic').val();
			// 获取文件的扩展名，并创建新的文件名
			var photoName = setFileName('pic', $('#filePic'));
			var picNodePath = 'images/'+photoName;
			//$('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张缩略图！',
		    	    timeout: 4000
				});
				$('#fileSmallPic').focus();
				return;
			}
			
			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formChangePicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					// 动态刷新图片
					if(val){	// 如果用户更换了图片
						var imgSrc = picNodePath;
						$(imgDom).attr("src", imgSrc);
						$(".content a[name='"+ nodeRelPath + "']").attr("href",imgSrc);
					}
					// 显示用户提示信息
					noty({
						layout: "topCenter",
						type: 'success',
						text: '图片修改成功！',
						timeout: 4000
					});
				}
			);
		});
		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
			deleteSequenceItem(nodeRelPath, oldPicFile);
		});
		// 点击添加图片按钮
		$('#btnAddPicFront').click(function(){
			addItem();
		});
		// 点击更换背景图片按钮
		$('#btnCheckBgPic').click(function(){
			CheckBgPic();
		});
		
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换当前图片');
	}
	function addItem(){
		// 清空form
		$("#dialog-form").empty();

		var data = {

		};
		var schema = {
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'filePic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':30
	            }
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formAddPicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonDataPic" name="" value="" />' +
			'<input type="hidden" name="_charset_" value="utf-8" />' + 
			'<input type="button" id="btnSubmitSeqItem" value="提 交" />'
		);

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){
			Mask.createMask();
			Mask.createWaiting();
			val = $('#filePic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张图！',
		    	    timeout: 4000
				});
				$('#filePic').focus();
				return;
			}
			
			// 设置图片文件存放路径
			var picFileName = 'images/'+setFileName('pic', $('#filePic'));
			//$('#filePic').attr('name',picFileName);

			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存图片的文件路径
			$('#jsonDataPic').attr('name',nodeName+'/img');
			$('#jsonDataPic').val(picFileName);
			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					$( "#dialog-form" ).dialog( "close" );
					// 显示用户提示信息
					noty({
						layout: "topCenter",
						type: 'success',
						text: '图片添加成功！',
						timeout: 4000
					});
					window.location.reload();
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('添加一个新的图片轮播项'); 
	}
	function CheckBgPic(){
		// 清空form
		$("#dialog-form").empty();

		var data = {

		};
		var schema = {
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'filePic',
	                'type': 'file',
	                'label': '选择替换背景的图片',
	                'size':30
	            }
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formBgPicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		var dataNodeName = "json/data/bg/img";
		var oldPicFile = "images" + $("#bg_image").attr("src").split("images")[1];
		$(formDom).append(
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			//'<input type="hidden" id="picjsonDel" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitSeqItem">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
			'</div>'
		);
		// 设置按钮样式
		$('#btnSubmitSeqItem').css('width','100px');
		$('#btnSubmitSeqItem').button( { icons: { primary: "ui-icon-check" } } );
		
		// 提交表单
		$('#btnSubmitSeqItem').click(function(){
			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#filePic').val();
			var photoName = setFileName('pic', $('#filePic'));
			var picNodePath = 'images/'+photoName;
			//$('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张更换的背景图！',
		    	    timeout: 4000
				});
				$('#filePic').focus();
				return;
			}
			
			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formBgPicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					$( "#dialog-form" ).dialog( "close" );
					// 动态刷新背景图片
					if(val){	// 如果用户更换了背景图片
						var imgSrc = picNodePath;
						$("#bg_image").attr("src", imgSrc);
					}
					// 显示用户提示信息
					noty({
						layout: "topCenter",
						type: 'success',
						text: '修改背景图片成功！',
						timeout: 4000
					});
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('修改背景图片'); 
	}
	function initOutputSize(data){
		var w= data['width'];
		var h = data['height'];
		if(!isNaN(w) && !isNaN(h)){
			$('body').height(h + 'px');
			$('body').width(w +'px');
		}else{
			$('body').height("100%");
			$('body').width("100%");
		}
	}
	// 初始化对话框
	function initDialog(){
		$( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 300,
			width: 350,
			modal: true,
			close: function() {
				$( this ).dialog( "close" );
			}
		});
	}
	function deleteSequenceItem(nodePath, oldPicFile){
		if(!nodePath){
			alert('deleteSequenceItem(nodePath) nodePath is undefined!');
			return;
		}
		// 弹出删除确认对话框
		// 提交删除
		noty({
			type: 'warning',
			layout: 'topCenter',
			text: '你确定要删除当前图片轮播项吗？',
			buttons: [
			    {
			    	addClass: 'btn btn-primary',
			    	text: '确 定', 
			    	onClick: function($noty) {
			    		// 关闭用户提示
				       	$noty.close();
				       	// 打开等待
				       	Mask.createMask();
						Mask.createWaiting();
				       	// 创建删除的form表单
						$( "#dialog-form" ).append(
							'<form id="formDeleteSeqItem" method="POST" enctype="multipart/form-data">'+
								'<input type="hidden" id="jsonData" name="'+nodePath+'@Delete" />' +
								'<input type="hidden" id="imageFile" name="'+oldPicFile+'@Delete" />' +
								'<input type="hidden" name="_charset_" value="utf-8" />'+
							'</form>'
						);
				       	// 获得当前图片轮播项的相对节点地址
				       	var postUrl = window.templatePath;
				       	// 提交请求
			            Gutil.uploadFile(
							"#formDeleteSeqItem", 
							postUrl, 
							function(data){
								// 刷新
								window.location.reload();
							}
						);
				    }
			    },
			    {
			    	addClass: 'btn btn-danger', 
			    	text: '取消', 
			    	onClick: function($noty) {
			      		$noty.close();
			      	}
			    }
			]
		});
	}
	// 创建JCR中的唯一节点名称
	var createNodeName = function(nodeType)
	{
		var nodeDate = new Date();
		var year = nodeDate.getFullYear().toString();
		var month = nodeDate.getMonth().toString();
		var day = nodeDate.getDate().toString();
		var hour = nodeDate.getHours().toString();
		var minute = nodeDate.getMinutes().toString();
		var second = nodeDate.getSeconds().toString();
		var millisecond = nodeDate.getMilliseconds().toString();
		var random = Math.random(millisecond).toString().substring(2,9);
		return nodeType+year+month+day+hour+minute+second+millisecond+random;
	}

	// 获取一个 file input 中文件的扩展名，并创建一个JCR文件节点名
	function setFileName(prefix, fileInput){
		var fileName = $(fileInput).val();
		var fileExt = fileName.substring(fileName.lastIndexOf('.'));
		var resName = createNodeName(prefix)+fileExt;
		return resName;
	}
})();