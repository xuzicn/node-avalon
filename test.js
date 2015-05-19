
var files = ["attr", "data"]//["data","if", "text", "visible","repeat", "css","duplex"]

var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path'),
    parse5 = require('parse5')
global.parser = new parse5.Parser()
global.serializer = new parse5.Serializer()
global.avalon = require('./avalon')
global.expect = require("./test/expect")
var mocha = new Mocha();   
global.removeMSScan = function (html) {
    return html.replace(/ ms-scan-\d+="[^"]+"/g,"");
}
global.removeComment = function (html) {
    return html.replace(/<!--\w+\d+(:end)?-->/g, "")
}
global.heredoc = function (fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}


files.forEach(function (val) {
    mocha.addFile(path.resolve(process.cwd(), 'test', val));
})

mocha.ui('tdd').run(function(failures){
    process.on('exit', function () {
        process.exit(failures);
    });
});



var elves = require("elves")
elves.install()


fs.mkdir('./demo/public', function(){})
files.forEach(function(name) {
    // 引入 js 文件，以字符串形式
    var scriptStr = fs.readFileSync('./demo/script/' + name + '.js', 'utf-8')
        // 引入 html 文件，以字符串形式
    var htmlStr = fs.readFileSync('./demo/html/' + name + '.html', 'utf-8')
    avalon.mainPath = "./demo/html/"
        // 在服务器上执行浏览器的脚本
    eval(scriptStr)

    var dom = parser.parse(htmlStr)

    //插入expect.js
    var headNode = avalon.getElementsTagName(dom, 'head');
    if (headNode.length == 0) {
        console.log("warning: 没有找到head节点，无法生成测试。")
        return;
    }
    headNode = headNode[0];
    headNode.childNodes.push({
        nodeName: 'script',
        tagName: 'script',
        attrs: [{ name: 'src', value : "../expect.js" }],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        nodeType: 1,
        parentNode: headNode,
        childNodes: []
    });

    avalon.scan(dom, vm)
    var str = serializer.serialize(dom);

    fs.writeFile('./demo/public/' + name + '.html', str, function(err) {
        // console.log('成功生成 ./public/' + name + '.html');
        elves.run([ { pageUrl: 'http://localhost:3000/demo/public/' + name + '.html',
            caseUrl: 'D:\\node-avalon\\demo\\testcases\\' + name + '.js' } ], {});
    });

})






