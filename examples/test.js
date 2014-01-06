var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

var url = system.args[1];
var png = system.args[2];

var errors = [];
var messages = [];
var resources = [];

page.onError = function(msg, trace) {
    errors.push({
        msg: msg,
        trace: trace.map(function(item) {
            return { file: item.file, line: item.line };
        }),
    });
};

page.onConsoleMessage = function(msg, line, source) {
    messages.push({
        msg: msg,
        line: line,
        source: source,
    });
};

page.onResourceReceived = function(response) {
    if (response.stage === 'end') {
        var status = response.status;

        // XXX: status is null for file:// protocol
        if (status && status !== 200) {
            resources.push(response);
        }
    }
};

// TODO: fit viewport's size to content
page.viewportSize = { width: 1000, height: 1000 };

page.open(url, function(status) {
    page.evaluate(function() {
        document.body.bgColor = 'white';
    });

    // TODO: get notified when Bokeh finished rendering
    window.setTimeout(function() {
        if (png !== undefined) {
            page.render(png);
        }

        console.log(JSON.stringify({
            status: status,
            errors: errors,
            messages: messages,
            resources: resources,
        }));

        phantom.exit();
    }, 1000);
});