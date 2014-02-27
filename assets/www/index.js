console.debug("[SP] start app");

// create the panorama player with the container
pano=new pano2vrPlayer("container");
// add the skin object
skin=new pano2vrSkin(pano);
// load the configuration
pano.readConfigUrl("pano_out.xml");
//pano.readConfigUrl(window.location.href.split('/')[5] + ".html5xml");

// hide the URL bar on the iPhone
hideUrlBar();

function receiveUrl(id)
{
	console.debug("[SP] receive id : "+id);
    var win_height = $(window).height()*0.7;
    var win_width = $(window).height()*0.90;
    console.debug("[SP] window height : " + win_height);
    console.debug("[SP] window width : " + win_width);
	$( "#relproductdialog" ).dialog({
		height: win_height,
		width: win_width,
		modal: true,
	    close: function() {
	    	console.debug("[SP] close window");
	        $( this ).dialog( "close" );
	    }
    });

	$( "#preview" ).attr('src','');
    $( "#relproductdialog" ).dialog('open');
    // http://stackoverflow.com/questions/16917430/jquery-ui-1-10-dialog-and-z-index
    $('.ui-dialog').css('zIndex', 3000);
    $('.ui-front').css('zIndex', 2000);
    
    var path;
    for(var key = 0;key < hotspots.length;key++)
	{
		if(hotspots[key]['id'] == id)
		{
			path = hotspots[key]['ref'];
			break;
		}
		
	}
	if(path)
	{
        console.debug("[SP] fill window content");
        console.debug("[SP] path:" + path);
		//var str = '<iframe id="preview" style="width:100%;height:98%;z-index:9999;" frameborder="1" src="'+path+'"></iframe>';
        var str = '<iframe id="preview" style="width:100%;height:98%;" frameborder="1" src="'+path+'"></iframe>';
        console.debug("[SP] iframe html:" + str);
		$('#relproductdialog').html(str);
	}
	else
	{
        console.debug("[SP] this hot spot has no showcase");
		$( "#relproductdialog" ).html('对不起，该展位没有关联展品');
	}
}

//receiveUrl(2)