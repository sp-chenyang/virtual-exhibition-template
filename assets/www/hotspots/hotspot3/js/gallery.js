
	//config
	//set default images view mode
	$defaultViewMode="full"; //full, normal, original
	//第一个缩略图的左边距和最后一个缩略的右边距
	$tsMargin=30; //first and last thumbnail margin (for better cursor interaction) 
	$scrollEasing=600; //scroll easing amount (0 for no easing) 
	$scrollEasingType="easeOutCirc"; //scroll easing type 
	$thumbnailsContainerOpacity=0.8; //thumbnails area default opacity
	$thumbnailsContainerMouseOutOpacity=0; //thumbnails area opacity on mouse out
	$thumbnailsOpacity=0.6; //thumbnails default opacity
	$nextPrevBtnsInitState="show"; //next/previous image buttons initial state ("hide" or "show")
	$keyboardNavigation="on"; //enable/disable keyboard navigation ("on" or "off")
	var totalContent=0;
	$toolbar=$("#toolbar");
	$toolbar_a=$("#toolbar a");
	$bgimg=$("#bgimg");
	$.init = function()
	{
		//cache vars
		$thumbnails_wrapper=$("#thumbnails_wrapper");
		$outer_container=$("#outer_container");
		$thumbScroller=$(".thumbScroller");
		$thumbScroller_container=$(".thumbScroller .container");
		$thumbScroller_content=$(".thumbScroller .content");
		$thumbScroller_thumb=$(".thumbScroller .thumb");
		$preloader=$("#preloader");
		
		$img_title=$("#img_title");
		$nextImageBtn=$(".nextImageBtn");
		$prevImageBtn=$(".prevImageBtn");
	}
	$.initload = function(){
		
		$.init();
		//初始默认设置图片为最大化状态。 为id为toolbar标签元素中附加数据 ，数据的名称为imageViewMode,数据值为full（或者normal）
		$toolbar.data("imageViewMode",$defaultViewMode);        
		if($defaultViewMode=="full"){
			$toolbar_a.html("<img src='images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "$.ImageViewMode('normal');return false").attr("title", "恢复");
		} else {
			$toolbar_a.html("<img src='imagestoolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "$.ImageViewMode('full');return false").attr("title", "最大化");
		}
		//显示上一个/下一个图片按钮
		ShowHideNextPrev($nextPrevBtnsInitState);
		//thumbnail scroller
		//设置缩略图的外边距
		$thumbScroller_container.css("marginLeft",$tsMargin+"px"); //add margin
		//获取class为thumbScroller_container的元素位置（元素的left位置）距离父元素（class 为thumbScroller的元素）的偏差。
		sliderLeft=$thumbScroller_container.position().left;
		sliderWidth=$outer_container.width();
		$thumbScroller.css("width",sliderWidth);
		
		fadeSpeed=200;
		
		$the_outer_container=document.getElementById("outer_container");
		 $placement=findPos($the_outer_container);
		$thumbScroller_content.each(function () {
			var $this=$(this);
			if($this.children().children().children(".thumb").width()){
				//获取每一个图片的宽度（包括内边距padding）
				totalContent+=$this.innerWidth();
			}else{
				totalContent+= 220;
			}
			$thumbScroller_container.css("width",totalContent);
			//规定当前元素从当前透明度一定的速度变换到指定的透明度值。
			$this.children().children().children(".thumb").fadeTo(fadeSpeed, $thumbnailsOpacity);
			$thumbnails_wrapper.fadeTo(fadeSpeed, $thumbnailsContainerOpacity);
		});
		//load 1st image
		//新建一个图片对象
		var the1stImg = new Image();
		//将背景图片的src赋值给新建图片对象src
		the1stImg.src = $bgimg.attr("src");
		//图片加载成功后执行的CreateDelegate函数
		the1stImg.onload = CreateDelegate(the1stImg, theNewImg_onload);
		//为$outer_container插入下一张图片的数据
		$outer_container.data("nextImage",$(".content").first().next().find("a").attr("href"));
		//为$outer_container插入上一张图片的数据
		$outer_container.data("prevImage",$(".content").last().find("a").attr("href"));
		//next/prev images keyboard arrows
		if($keyboardNavigation=="on"){
			$(document).keydown(function(ev) {
				if(ev.keyCode == 39) { //right arrow
					SwitchImage($outer_container.data("nextImage"));
					var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
					GetNextPrevImages($this);
					GetImageTitle($this);
					return false; // don't execute the default action (scrolling or whatever)
				} else if(ev.keyCode == 37) { //left arrow
					SwitchImage($outer_container.data("prevImage"));
					var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
					GetNextPrevImages($this);
					GetImageTitle($this);
					return false; // don't execute the default action (scrolling or whatever)
				}
			});
		}
		//mouseover toolbar
		if($toolbar.css("display")!="none"){
			$toolbar.fadeTo("fast", 0.4);
		}
		init_event();
	}
		
		
	function init_event(){	
		$thumbScroller.mousemove(function(e){
			if($thumbScroller_container.width()>sliderWidth){
				//鼠标相对于文档的左边缘的X坐标的位置
				var mouseCoords=(e.pageX - $placement[1]);
				var mousePercentX=mouseCoords/sliderWidth;
				var destX=-((((totalContent+($tsMargin*2))-(sliderWidth))-sliderWidth)*(mousePercentX));
				var thePosA=mouseCoords-destX;
				var thePosB=destX-mouseCoords;
				if(mouseCoords>destX){
					$thumbScroller_container.stop().animate({left: -thePosA}, $scrollEasing,$scrollEasingType); //with easing
				} else if(mouseCoords<destX){
					$thumbScroller_container.stop().animate({left: thePosB}, $scrollEasing,$scrollEasingType); //with easing
				} else {
					$thumbScroller_container.stop();  
				}
			}
		});

		
		$thumbnails_wrapper.hover(
			function(){ //mouse over
				var $this=$(this);
				$this.stop().fadeTo("slow", 1);
			},
			function(){ //mouse out
				var $this=$(this);
				$this.stop().fadeTo("slow", $thumbnailsContainerMouseOutOpacity);
			}
		);

		$thumbScroller_thumb.hover(
			function(){ //mouse over
				var $this=$(this);
				$this.stop().fadeTo(fadeSpeed, 1);
			},
			function(){ //mouse out
				var $this=$(this);
				$this.stop().fadeTo(fadeSpeed, $thumbnailsOpacity);
			}
		);

		//on window resize scale image and reset thumbnail scroller
		//$(window).resize(function() {
			//FullScreenBackground("#bgimg",$bgimg.data("newImageW"),$bgimg.data("newImageH"));
			//$thumbScroller_container.stop().animate({left: sliderLeft}, 400,"easeOutCirc"); 
			//var newWidth=$outer_container.width();
			//$thumbScroller.css("width",newWidth);
			//sliderWidth=newWidth;
			//$placement=findPos($the_outer_container);
		//});

		
	
	
	
	//Clicking on thumbnail changes the background image
	$("#outer_container a").click(function(event){
		event.preventDefault();
		var $this=$(this);
		GetNextPrevImages($this);
		GetImageTitle($this);
		SwitchImage(this);
		ShowHideNextPrev("show");
	}); 

	//next/prev images buttons
	$nextImageBtn.click(function(event){
		event.preventDefault();
		SwitchImage($outer_container.data("nextImage"));
		var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
		GetNextPrevImages($this);
		GetImageTitle($this);
	});

	$prevImageBtn.click(function(event){
		event.preventDefault();
		SwitchImage($outer_container.data("prevImage"));
		var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
		GetNextPrevImages($this);
		GetImageTitle($this);
	});
 }

	function BackgroundLoad($this,imageWidth,imageHeight,imgSrc){
		$this.fadeOut("fast",function(){
			$this.attr("src", "").attr("src", imgSrc); //change image source
			//FullScreenBackground($this,imageWidth,imageHeight); //scale background image
			$preloader.fadeOut("fast",function(){$this.fadeIn("slow");});
			var imageTitle=$img_title.data("imageTitle");
			if(imageTitle){
				$this.attr("alt", imageTitle).attr("title", imageTitle);
				$img_title.fadeOut("fast",function(){
					$img_title.html(imageTitle).fadeIn();
				});
			} else {
				$img_title.fadeOut("fast",function(){
					$img_title.html($this.attr("title")).fadeIn();
				});
			}
		});
	}

	
	$toolbar.hover(
		function(){ //mouse over
			var $this=$(this);
			$this.stop().fadeTo("fast", 1);
		},
		function(){ //mouse out
			var $this=$(this);
			$this.stop().fadeTo("fast", 0.4);
		}
	);
	function ShowHideNextPrev(state){
		if(state=="hide"){
			$nextImageBtn.fadeOut();
			$prevImageBtn.fadeOut();
		} else {
			$nextImageBtn.fadeIn();
			$prevImageBtn.fadeIn();
		}
	}

	//get image title
	function GetImageTitle(elem){
		var title_attr=elem.children("img").attr("title"); //get image title attribute
		$img_title.data("imageTitle", title_attr); //store image title
	}

	//get next/prev images
	function GetNextPrevImages(curr){
		var nextImage=curr.parents(".content").next().find("a").attr("href");
		if(nextImage==null){ //if last image, next is first
			var nextImage=$(".content").first().find("a").attr("href");
		}
		$outer_container.data("nextImage",nextImage);
		var prevImage=curr.parents(".content").prev().find("a").attr("href");
		if(prevImage==null){ //if first image, previous is last
			var prevImage=$(".content").last().find("a").attr("href");
		}
		$outer_container.data("prevImage",prevImage);
	}

	//switch image
	function SwitchImage(img){
		$preloader.fadeIn("fast"); //show preloader
		var theNewImg = new Image();
		theNewImg.onload = CreateDelegate(theNewImg, theNewImg_onload);
		//theNewImg.name = img.children[0].name;
		theNewImg.src = img;
	}
	function GetImagePosition(cur){
		var num = cur[0].children[0].name;
		var kk = $bgimg.attr("name");
		$bgimg.attr("title", "").attr("title",num);
		$bgimg.attr("name", "").attr("name",num);
	}
	
	//get new image dimensions
	function CreateDelegate(contextObject, delegateMethod){
		return function(){
			return delegateMethod.apply(contextObject, arguments);
		}
	}

	//new image on load
	function theNewImg_onload(){
		$bgimg.data("newImageW",this.width).data("newImageH",this.height);
		//$bgimg.attr("name",this.name);
		BackgroundLoad($bgimg,this.width,this.height,this.src);
	}

	//Image scale function
	function FullScreenBackground(theItem,imageWidth,imageHeight){
		var winWidth=$(window).width();
		var winHeight=$(window).height();
		if($toolbar.data("imageViewMode")!="original"){ //scale
			var picHeight = imageHeight / imageWidth;
			var picWidth = imageWidth / imageHeight;
			if($toolbar.data("imageViewMode")=="full"){ //fullscreen size image mode
				if ((winHeight / winWidth) < picHeight) {
					$(theItem).attr("width",winWidth);
					$(theItem).attr("height",picHeight*winWidth);
				} else {
					$(theItem).attr("height",winHeight);
					$(theItem).attr("width",picWidth*winHeight);
				};
			} else { //normal size image mode
				if ((winHeight / winWidth) > picHeight) {
					$(theItem).attr("width",winWidth);
					$(theItem).attr("height",picHeight*winWidth);
				} else {
					$(theItem).attr("height",winHeight);
					$(theItem).attr("width",picWidth*winHeight);
				};
			}
			$(theItem).css("margin-left",(winWidth-$(theItem).width())/2);
			$(theItem).css("margin-top",(winHeight-$(theItem).height())/2);
		} else { //no scale
			$(theItem).attr("width",imageWidth);
			$(theItem).attr("height",imageHeight);
			$(theItem).css("margin-left",(winWidth-imageWidth)/2);
			$(theItem).css("margin-top",(winHeight-imageHeight)/2);
		}
	}

	//Image view mode function - fullscreen or normal size
	$.ImageViewMode = function(theMode){
		$toolbar.data("imageViewMode", theMode);
		FullScreenBackground($bgimg,$bgimg.data("newImageW"),$bgimg.data("newImageH"));
		if(theMode=="full"){
			$toolbar_a.html("<img src='images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "$.ImageViewMode('normal');return false").attr("title", "恢复");
		} else {
			$toolbar_a.html("<img src='images/toolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "$.ImageViewMode('full');return false").attr("title", "最大化");
		}
	}

	//function to find element Position
		function findPos(obj) {
			var curleft = curtop = 0;
			if (obj.offsetParent) {
				curleft = obj.offsetLeft
				curtop = obj.offsetTop
				while (obj = obj.offsetParent) {
					curleft += obj.offsetLeft
					curtop += obj.offsetTop
				}
			}
			return [curtop, curleft];
		}