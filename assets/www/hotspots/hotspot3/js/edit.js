(function(){
	$(document).ready(function(){
		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
			initOutputSize(data);
			// 创建 DOM 节点，添加图片轮播项
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
	
	function bindEditEvent()
	{
		
		//给缩略图监听点击事件
		$("#outer_container a img").click(function(event){
			// 弹出修改缩略图片的UI
			showChangePictureUI($(this));	
		});
		// 修改标题
		$("#img_title").click(function(event){
			changeText($(this));
		});
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
		// 获取缩略图图片地址的存放路径 json/data/key/thumbnail
		var dataNodeName = nodeRelPath+'/thumbnail';
		// 获取背景大图片地址的存放路径 json/data/key/img
		var bgDataNodeName = nodeRelPath+'/img';
		// 获取当前被替换图片的文件名，替换后需要删除掉
		
		var oldPicFile = $(imgDom).attr('src');
		var oldBgPicFile = $(imgDom).parent().attr('href');
		var data = {
		};
		var schema = {
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				},
				'fileBgPicName':{
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
	                'label': '选择缩略图片',
	                'size':30
	            },
				'fileBgPicName': {
	            	'id':'fileBgPic',
	                'type': 'file',
	                'label': '选择背景大图片',
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
			'<input type="hidden" id="bgjsonData" name="'+bgDataNodeName+'" value="" />'+ 
			//'<input type="hidden" id="picjsonDel" name="'+oldPicFile+'@Delete" />'+ 
			//'<input type="hidden" id="bgPicjsonDel" name="'+oldBgPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitPicture">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
				'<button id="btnDeletePicture"> 删除此图片 </button>' +
				//'<br /><br /><br /><br /><hr /><br />' + 
				//'<button id="btnAddPicFront">添加图片</button>&nbsp;&nbsp;' +
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','200px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		//$('#btnAddPicFront').button( { icons: { primary: "ui-icon-seek-prev" } } );
		$('#btnAddPicBack').button( { icons: { primary: "ui-icon-seek-next" } } );
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
			var bgVal = $('#fileBgPic').val();
			var bgPhotoName = setFileName('pic', $('#fileBgPic'));
			var bgPicNodePath = 'images/'+bgPhotoName;
			//$('#fileBgPic').attr('name',bgPicNodePath);
			$('#bgjsonData').val(bgPicNodePath);
			// 如果用户没有选择文件，则把文件框和文件地址隐藏域删掉
			// 也就是只更新点击后的链接，不更新图片
			if(!val){
				$('#filePic').remove();
				$('#jsonData').remove();
				//$('#picjsonDel').remove();
			}
			if(!bgVal){
				$('#fileBgPic').remove();
				$('#bgjsonData').remove();
				$('#bgPicjsonDel').remove();
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
					if(val){	// 如果用户更换了缩略图片
						var imgSrc = picNodePath;
						$(imgDom).attr("src", imgSrc+"?rand="+Math.random());
					}
					if(bgVal){	// 如果用户更换了背景大图片
						var imgSrc = bgPicNodePath;
						$("#bgimg").attr("src", imgSrc+"?rand="+Math.random());
						$(imgDom).parent().attr("href", imgSrc+"?rand="+Math.random());
						
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
			var items = $(".thumb");
			if(items.length != 1){
				deleteSequenceItem(nodeRelPath);
			}else {
				// 显示用户提示信息
				noty({
					layout: "topCenter",
					type: 'warning',
					text: '当前版块只有一张图片,不支持删除操作！',
					timeout: 4000
				});
			}
		});
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:450 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换图片'); 
	}
	function addItem(){
		// 清空form
		$("#dialog-form").empty();

		var data = {

		};
		var schema = {
			"description": "添加一个新的图片轮播项",
			'properties':{
				'fileBigPicName':{
					"type": "string",
            		"format": "uri"
				},
				'fileSmallPicName':{
					"type": "string",
            		"format": "uri"
				},
				'title':{
					"type": "string",
					'default': ""
				}
			}
		};
		var options = {
			'fields': {
	            'fileBigPicName': {
	            	'id':'fileBigPic',
	                'type': 'file',
	                'label': '选择大图',
	                'size':30
	            },
	            'fileSmallPicName': {
	            	'id':'fileSmallPic',
	                'type': 'file',
	                'label': '选择缩略图',
	                'size':30
	            },
				'title': {
	            	'id':'title',
	                'type': 'text',
	                'label': '图片标题'
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
			'<input type="hidden" id="jsonDataBigPic" name="" value="" />' +
			'<input type="hidden" id="jsonDataSmallPic" name="" value="" />'+
			'<input type="hidden" name="_charset_" value="utf-8" />' + 
			'<input type="button" id="btnSubmitSeqItem" value="提 交" />'
		);

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){

			var val = $('#fileBigPic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张大图！',
		    	    timeout: 4000
				});
				$('#fileBigPic').focus();
				return;
			}
			val = $('#fileSmallPic').val();
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
			val = $('#title').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请输入标题！',
		    	    timeout: 4000
				});
				$('#title').focus();
				return;
			}
			// 设置大图片文件存放路径
			var bigPicFileName = 'images/'+setFileName('pic', $('#fileBigPic'));
			$('#fileBigPic').attr('name',bigPicFileName);

			// 设置小图片文件存放路径
			var smallPicFileName = 'images/'+setFileName('pic', $('#fileSmallPic'));
			$('#fileSmallPic').attr('name',smallPicFileName);

			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);
			// 保存小图片的文件路径
			$('#jsonDataSmallPic').attr('name',nodeName+'/thumbnail');
			$('#jsonDataSmallPic').val(smallPicFileName);
			//设置图片标题
			$('#title').attr('name',nodeName+'/title');
			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(data){
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
	// 修改文字的UI
	function changeText(textDom)
	{
		// 清空form
		$( "#dialog-form").empty();
		// 获取文本内容
		var text = $(textDom).html();
		console.log(text,"text");
		if(text.indexOf('<input')>-1 || text.indexOf('<INPUT')>-1){
			return;
		}
		// 把文本内容换成文本框
		var innerHTML = '<input type="text" id="titleText" value="'+text+'" '+
			' style="width:80%;height:25px;font-size:14px;padding:2px;" maxlength="100" />';
		$(textDom).html(innerHTML);
		// 默认文本框获得焦点
		$('#titleText').focus();
		
		// 添加文本框的失去焦点事件
		$('#titleText').on('blur',function(){
			var value = $('#titleText').val();
			console.log(value,"value");
			if(!value){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请输入标题内容',
		    	    timeout: 4000
				});
				$('#titleText').focus();
				return;
			}
			if(text==value){
				$(textDom).html(value);
				return;
			}
			var nodeRelPath = $("#bgimg").attr('name');
			if(!nodeRelPath){
				alert('初始化节点时没有正确设置 nodeRelPath !');
				return;
			}
		
			$( "#dialog-form" ).append(
				'<form id="formUpdateSeqItem" method="POST" enctype="multipart/form-data">'+
					'<input type="hidden" id="jsonProperty" name="" value="" />' +
					'<input type="hidden" name="_charset_" value="utf-8" />' + 
				'</form>'
			);
	       	// 设置 form 表单中要提交的数据
	       	$('#jsonProperty').attr('name', nodeRelPath+'/title');
	       	$('#jsonProperty').val(value);
	       	// 提交请求
	       	var postUrl = window.templatePath;
            Gutil.uploadFile(
				"#formUpdateSeqItem", 
				postUrl, 
				function(data){
                	noty({
						layout: "topCenter", 
			    		type: 'success',
			    	    text: '文字介绍修改成功！',
			    	    timeout: 4000
					});
					// 动态设置标题
					$(textDom).html(value);
					var thumb = $("a img[name='" + nodeRelPath + "']");
					if(thumb.length){
						thumb[0].alt = value;
						thumb[0].title = value;
					}
				}
			);	// @drupal 修改到这里
		});
	}
	function deleteSequenceItem(nodePath){
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
	/*************************************************************************************
	个性定制面板
	*************************************************************************************/	

	// 个性定制面板默认是关闭状态			
	var flag_openCustomDialog = false;
	// 打开个性定制对话框
	window.openCustomDialog = function()
	{
		// 如果传入参数 false 则关闭当前对话框
		if(flag_openCustomDialog){
			$( "#dialog-form" ).dialog('close');
			flag_openCustomDialog = false;
			return;
		}

		// 清空form
		$( "#dialog-form").empty();

		var data = {
		};
		var schema = {
			'properties':{
				
			}
		};
		var options = {
			'fields': {
				
			},
			'renderForm':true,
			 'form':{
				"attributes": {
					"id":"formChangePicture1",
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
			'<hr />'+
			'<br /><a id="replacePrePic" class="abtn">[插入图片]</a><br />'
		);

		// 给个性定制面板中的元素绑定事件
		// 替换预加载图片
		$("#replacePrePic").click(function(event){
			//弹出添加图片的UI
			addItem();	
		});
		
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:350, width:400 });
		$( "#dialog-form" ).dialog({
			close: function() {
				$( this ).dialog( "close" );
				flag_openCustomDialog = false;
			}
		});
		$( "#dialog-form" ).dialog('open');
		flag_openCustomDialog = true;
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('个性定制'); 
	}
		
	// 获取一个 file input 中文件的扩展名，并创建一个JCR文件节点名
	function setFileName(prefix, fileInput){
		var fileName = $(fileInput).val();
		var fileExt = fileName.substring(fileName.lastIndexOf('.'));
		var resName = createNodeName(prefix)+fileExt;
		return resName;
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