/*
* background.js by Jeremy Karmel. 
*/

URLS = ['http://www.apple.com/',
        'http://www.google.com/',
        'http://www.facebook.com/',
        'http://www.stanford.edu'];


var getLinks = function() {
    var links = [];
    var $links = $('a');
    $links.each(function(i, val) {links.push(val.href)});
    console.log(links);
    var request = {data: links, url: window.location.href};
    console.log(request);
    chrome.extension.sendRequest(request);
}

var main = function() {
    var specForUsersTopics = {
        urls     : URLS,
        code     : getLinks,
        callback : function(results) {
            for (var url in results) {
                console.log(url + ' has ' + results[url].length + ' links.');
                var links = results[url];
                for (var i = 0; i < links.length; i++) 
                    console.log(links[i]);
            }
            console.log('all done!!!!');
        }
    };
    var exec = Executor(specForUsersTopics);
    exec.start();
}

main();

