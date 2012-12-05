function switch_content(elem){
	var $elem = $(elem);
		nav_id = $elem.attr("id");

	if($elem.hasClass('selected')){
		return;
	}

	$elem.addClass("selected");
	$elem.siblings("li").removeClass("selected");

	$(".content.selected").removeClass("selected");
	$(".content#" + nav_id).addClass("selected");
}