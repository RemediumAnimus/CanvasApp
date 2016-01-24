requirejs.config({
    baseUrl: 'js/lib',    
    paths: {
        app: '../app',
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

require(['jquery','app/exchange','app/canvas'],
	function($,exchange,canvas) {
		exchange.unit();
		canvas.unit();       
	}
		
);


