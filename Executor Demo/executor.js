// var currentResult;

var Executor = function(spec) {
	var that = {}; //For public stuff
	var my	 = {}; //For private stuff
	
	my.tabIDs   = []; 	//Array of tabs in the wnd
	my.wndID    = null;	//ID of wndn executor will use
	
	that.urls 			= spec.urls.slice();
	that.code 			= spec.code;
	that.max_tabs	    = spec.max_tabs || 5;
	that.callback       = spec.callback;
	that.urls_remaining	= spec.urls.slice();
	
	that.urls_running   = [];
	that.tabs			= {};
	that.results		= {};
    
    my.scriptMaker = function(code) {
        var script = "var __main = " + code.toString() + ";\n__main();";
        return script;
    };

	my.setupListener = function() {
		chrome.extension.onRequest.addListener(
		    //Code for tab finishing response
			function(request, sender, sendResponse){
	            that.results[sender.tab.url] = request.data;
	            that.urls_running.remove(sender.tab.url);
	            
                // console.log(sender.tab.url + ' returned'
                //     + that.urls_remaining.length + " out of " 
                //     + that.urls.length + " remaining");
	            currentResult = that;
                // console.log(that);
	            if (that.urls_remaining.length == 0 && 
	                    that.urls_running.length == 0) {
	                my.clearListeners();        
	                        
                    // console.log("activate callback");
	                that.callback(that.results);
	            } else {
	                that.urls_remaining.remove(that.urls_remaining[0]);
	                if (!that.urls_remaining.length == 0) {
                        // console.log('past');
    	                //get another url to tab and start running
        	            chrome.tabs.update(sender.tab.id, {
                            url: that.urls_remaining[0]
        	            })
        	            that.urls_running.push(that.urls_remaining[0]);
        	            chrome.tabs.executeScript(sender.tab.id,
                            {code:my.scriptMaker(that.code)});
                    }
	            }
			}
	    );
	}
	
	my.clearListeners = function() {
	    chrome.extension.onRequest.listeners_ = [];
	}
	
	my.setupListener();
	
	that.start 		= function() {
		var init_tab_num  =  (that.max_tabs < that.urls.length) ? 
			that.max_tabs : that.urls.length;
		init_urls 		  = that.urls.slice(0,init_tab_num);
		
		chrome.windows.create({	url    : init_urls, 
								height : 100,
								width  : 100}, 
								function (wnd) {	
			my.wndID = wnd.id;
			chrome.tabs.getAllInWindow(my.wndID,
				function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						my.tabIDs.push(tabs[i].id);
						that.urls_remaining.remove(tabs[i].url);
						that.urls_running.push(tabs[i].url);
						chrome.tabs.executeScript(tabs[i].id,
                            {code:my.scriptMaker(that.code)});
					}
				})});
	};
    

	return that;
}


Array.prototype.remove = function(elToRemove){
	for (var i=0; i < this.length; i++){
		if (elToRemove == this[i]) this.splice(i, 1);
	}
	return this;
}

