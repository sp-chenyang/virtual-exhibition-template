
	
	$defaultViewMode="normal"; //full, normal, original
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
		
		//$img_title=$("#img_title");
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
		//ShowHideNextPrev($nextPrevBtnsInitState);
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
		//为$outer_container插入下一张图片的数据
		$outer_container.data("nextImage",$(".content").first().next().find("a").attr("href"));
		$outer_container.data("nextImageName",$(".content").first().next().find("a").attr("name"));
		//为$outer_container插入上一张图片的数据
		$outer_container.data("prevImage",$(".content").last().find("a").attr("href"));
		$outer_container.data("prevImageName",$(".content").last().find("a").attr("name"));
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
	//next/prev images buttons
	$nextImageBtn.click(function(event){
		//event.preventDefault();
		SwitchImage($outer_container.data("nextImage"),$outer_container.data("nextImageName"));
		var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
		GetNextPrevImages($this);
		
	});

	$prevImageBtn.click(function(event){
		//event.preventDefault();
		SwitchImage($outer_container.data("prevImage"),$outer_container.data("prevImageName"));
		var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']" );
		GetNextPrevImages($this);
	});
 }

	function BackgroundLoad($this,imageWidth,imageHeight,imgSrc,imgJson){
		$this.attr("src", "").attr("src", imgSrc); //change image source
		$("#bgimg").attr("name", "").attr("name", imgJson);
	}
	//get next/prev images
	function GetNextPrevImages(curr){
		var nextImage=curr.parents(".content").next().find("a").attr("href");
		var nextImageName = curr.parents(".content").next().find("a").attr("name");
		if(nextImage==null){ //if last image, next is first
			nextImage=$(".content").first().find("a").attr("href");
			nextImageName = $(".content").first().find("a").attr("name");
		}
		$outer_container.data("nextImage",nextImage);
		var prevImage=curr.parents(".content").prev().find("a").attr("href");
		var prevImageName = curr.parents(".content").prev().find("a").attr("name");
		if(prevImage==null){ //if first image, previous is last
			prevImage=$(".content").last().find("a").attr("href");
			prevImageName = $(".content").last().find("a").attr("name");
		}
		$outer_container.data("prevImage",prevImage);
		$outer_container.data("prevImageName",prevImageName);
	}

	//switch image
	function SwitchImage(img,img_json){
		var theNewImg = new Image();
		theNewImg.onload = CreateDelegate(theNewImg, theNewImg_onload);
		theNewImg.src = img;
		theNewImg.name = img_json;
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
		BackgroundLoad($bgimg,this.width,this.height,this.src,this.name);
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