
  function openClose(theID) {
    if(document.getElementById(theID).style.display == "block") { 
      document.getElementById(theID).style.display = "none" 
    }
    else { 
      document.getElementById(theID).style.display = "block" 
    } 
  }

  function openMenu(theID) {
      document.getElementById(theID).style.display = "block" 
  }

  function closeMenu(theID) {
      document.getElementById(theID).style.display = "none" 
  }

	
	var src = null;
	var prev = null;
	var livetime = null;
	var msie = false;
	var stopped = false;
	var timer = null;
	var pr = 0;
	var liking = 0;
	var in_progress = false;
	var langSelect = false;

	$(document).ready(function() {
		$.ajaxSetup({cache: false});

		msie = $.browser.msie ;
 		NavUpdate(); 
		// Allow folks to stop the ajax page updates with the pause/break key
		$(document).keypress(function(event) {
			if(event.keyCode == '19') {
				event.preventDefault();
				if(stopped == false) {
					stopped = true;
					$('#pause').html('<img src="images/pause.gif" alt="pause" style="border: 1px solid black;" />');
				}
				else {
					stopped = false;
					$('#pause').html('');
				}
			}
			// F8 - show/hide language selector
			if(event.keyCode == '119') {
				if(langSelect) {
					langSelect = false;
					$('#language-selector').hide();
				}
				else {
					langSelect = true;
					$('#language-selector').show();
				}
			}		

// this is shift-home on FF, but $ on IE, disabling until I figure out why the diff.
// update: incompatible usage of onKeyDown vs onKeyPress
//			if(event.keyCode == '36' && event.shiftKey == true) {
//				if(homebase !== undefined) {
//					event.preventDefault();
//					document.location = homebase;
//				}
//			}
		});					
	});

	function NavUpdate() {

		if($('#live-network').length) { src = 'network'; liveUpdate(); }
		if($('#live-profile').length) { src = 'profile'; liveUpdate(); }
		if($('#live-display').length) { 
			if(liking) {
				liking = 0;
				window.location.href=window.location.href 
			}
		}
		if($('#live-photos').length)  { 
			if(liking) {
				liking = 0;
				window.location.href=window.location.href 
			}
		}

		if(! stopped) {
			$.get("ping",function(data) {
				$(data).find('result').each(function() {
					var net = $(this).find('net').text();
					if(net == 0) { net = ''; }
					$('#net-update').html(net);
					var home = $(this).find('home').text();
					if(home == 0) { home = ''; }
					$('#home-update').html(home);
					var mail = $(this).find('mail').text();
					if(mail == 0) { mail = ''; }
					$('#mail-update').html(mail);
					var intro = $(this).find('intro').text();
					var register = $(this).find('register').text();
					if(intro == 0) { intro = ''; }
					if(register != 0 && intro != '') { intro = intro+'/'+register; }
					if(register != 0 && intro == '') { intro = '0/'+register; }
					$('#notify-update').html(intro);

				});
			}) ;
		}
		timer = setTimeout(NavUpdate,30000);

	}

	function liveUpdate() {
		if((src == null) || (stopped) || (! profile_uid)) { $('.like-rotator').hide(); return; }
		if(($('.comment-edit-text-full').length) || (in_progress)) {
			livetime = setTimeout(liveUpdate, 10000);
			return;
		}
		prev = 'live-' + src;

		in_progress = true;
		var udargs = ((netargs.length) ? '/' + netargs : '');
		var update_url = 'update_' + src + udargs + '?p=' + profile_uid + '&page=' + profile_page + '&msie=' + ((msie) ? 1 : 0);

		$.get(update_url,function(data) {
			in_progress = false;
			$('.ccollapse-wrapper',data).each(function() {
				var ident = $(this).attr('id');
				if($('#' + ident).length) {
					$('#' + ident).replaceWith($(this));
				}
			});
			$('.wall-item-outside-wrapper',data).each(function() {
				var ident = $(this).attr('id');
				if($('#' + ident).length == 0) { 
					$('img',this).each(function() {
						$(this).attr('src',$(this).attr('dst'));
					});
					$('#' + prev).after($(this));
				}
				else { 

					$('#' + ident + ' ' + '.wall-item-ago').replaceWith($(this).find('.wall-item-ago')); 
					$('#' + ident + ' ' + '.wall-item-comment-wrapper').replaceWith($(this).find('.wall-item-comment-wrapper'));
					$('#' + ident + ' ' + '.wall-item-like').replaceWith($(this).find('.wall-item-like'));
					$('#' + ident + ' ' + '.wall-item-dislike').replaceWith($(this).find('.wall-item-dislike'));
					$('#' + ident + ' ' + '.my-comment-photo').each(function() {
						$(this).attr('src',$(this).attr('dst'));
					});
				}
				prev = ident; 
			});
			$('.like-rotator').hide();
		});

	}

	function imgbright(node) {
		$(node).attr("src",$(node).attr("src").replace('hide','show'));
		$(node).css('width',24);
		$(node).css('height',24);
	}

	function imgdull(node) {
		$(node).attr("src",$(node).attr("src").replace('show','hide'));
		$(node).css('width',16);
		$(node).css('height',16);
	}

	// Since our ajax calls are asynchronous, we will give a few 
	// seconds for the first ajax call (setting like/dislike), then 
	// run the updater to pick up any changes and display on the page.
	// The updater will turn any rotators off when it's done. 
	// This function will have returned long before any of these
	// events have completed and therefore there won't be any
	// visible feedback that anything changed without all this
	// trickery. This still could cause confusion if the "like" ajax call
	// is delayed and NavUpdate runs before it completes.

	function dolike(ident,verb) {
		$('#like-rotator-' + ident.toString()).show();
		$.get('like/' + ident.toString() + '?verb=' + verb );
		if(timer) clearTimeout(timer);
		timer = setTimeout(NavUpdate,3000);
		liking = 1;
	}

	function getPosition(e) {
		var cursor = {x:0, y:0};
		if ( e.pageX || e.pageY  ) {
			cursor.x = e.pageX;
			cursor.y = e.pageY;
		}
		else {
			if( e.clientX || e.clientY ) {
				cursor.x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
				cursor.y = e.clientY + (document.documentElement.scrollTop  || document.body.scrollTop)  - document.documentElement.clientTop;
			}
			else {
				if( e.x || e.y ) {
					cursor.x = e.x;
					cursor.y = e.y;
				}
			}
		}
		return cursor;
	}

	var lockvisible = false;

	function lockview(event,id) {
		event = event || window.event;
		cursor = getPosition(event);
		if(lockvisible) {
			lockviewhide();
		}
		else {
			lockvisible = true;
			$.get('lockview/' + id, function(data) {
				$('#panel').html(data);
				$('#panel').css({ 'left': cursor.x + 5 , 'top': cursor.y + 5});
				$('#panel').show();
			});
		}
	}

	function lockviewhide() {
		lockvisible = false;
		$('#panel').hide();
	}

	function post_comment(id) {
		$.post(  
             "item",  
             $("#comment-edit-form-" + id).serialize(),
			function(data) {
				if(data.success) {
					$("#comment-edit-wrapper-" + id).hide();
					$("#comment-edit-text-" + id).val('');
    	  			var tarea = document.getElementById("comment-edit-text-" + id);
					if(tarea)
						commentClose(tarea,id);
					if(timer) clearTimeout(timer);
					timer = setTimeout(NavUpdate,10);
				}
				if(data.reload) {
					window.location.href=data.reload;
				}
					
			},
			"json"  
         );  
         return false;  
	}


    function bin2hex(s){  
        // Converts the binary representation of data to hex    
        //   
        // version: 812.316  
        // discuss at: http://phpjs.org/functions/bin2hex  
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)  
        // +   bugfixed by: Onno Marsman  
        // +   bugfixed by: Linuxworld  
        // *     example 1: bin2hex('Kev');  
        // *     returns 1: '4b6576'  
        // *     example 2: bin2hex(String.fromCharCode(0x00));  
        // *     returns 2: '00'  
        var v,i, f = 0, a = [];  
        s += '';  
        f = s.length;  
          
        for (i = 0; i<f; i++) {  
            a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/,"0$1");  
        }  
          
        return a.join('');  
    }  