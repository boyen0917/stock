/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
function XmlParser(doc) { this.doc = doc; }

XmlParser.prototype = {
    getChildValue: function (node, childTagName, childIndex) {
        childIndex = childIndex || 0;
        var childTagIndex = -1;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeName == childTagName) {
                childTagIndex += 1;
                if(childTagIndex == childIndex)
                    return child.firstChild.data;
            }
        }
        return null;
        //return node.getElementsByName(childTagName)[childIndex || 0].nodeValue;
    },
    getValue: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var preLevelNodeList = [];
        var node = doc;
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (sec.charAt(0) == '@') {
                sec = sec.substring(1, sec.length);
                return node.getAttribute(sec);
            }

            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);
                node = this._getChildren(node, nodeName)[index];
            } else {
                node = this._getChildren(node, sec)[0];
            }
        }
        return node.nodeValue;
    },
    getNode: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var previousNode = doc;
        var node;
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (i > 0 && node) { previousNode = node; node = null; }
            var nodeName;
            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);
                node = this._getChildren(previousNode, nodeName)[index];
            } else {
                node = this._getChildren(previousNode, sec)[0];
            }
        }
        return node;
    },
    getNodes: function (path) {
        var doc = this.doc;
        var secs = path.split('/');
        var preLevelNodeList = [];
        preLevelNodeList.push(doc);
        var nodeList = [];
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i];
            if (sec == '') continue;
            if (i > 0 && nodeList.length) { preLevelNodeList = nodeList; nodeList = []; }
            var nodeName;
            var node;
            var index = sec.indexOf('[');
            if (index > 0) {
                nodeName = sec.substring(0, index);
                index = sec.substr(index + 1, sec.length - index - 2);

                for (var j = 0; j < preLevelNodeList.length; j++) {
                    node = this._getChildren(preLevelNodeList[j], nodeName)[index];
                    nodeList.push(node);
                }
            } else {
                for (var j = 0; j < preLevelNodeList.length; j++) {
                    var nodes = this._getChildren(preLevelNodeList[j], sec);
                    for (var k = 0; k < nodes.length; k++) nodeList.push(nodes[k]);
                }
            }
        }
        return nodeList;
    },
    _getChildren: function (node, name) {
        var result = [];
        if (node.childNodes.length) {
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].nodeName == name) result.push(node.childNodes[i]);
            }
        }
        return result;
    }
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*options like:
{
    region:{x:x,y:y,width:width,height:height},
    bar:{width:1,color:'red'},
    maxDotsCount:241,
    getDataLength:function(){return this.data.items.length;}
}
*/
function volumePainter(options) {
    this.options = options;

    this.barWidth = options.bar.width;
    this.spaceWidth = options.region.width / options.maxDotsCount - options.bar.width;
    if (this.spaceWidth < 1) this.spaceWidth = 0;
    if (this.barWidth * options.maxDotsCount > options.region.width) this.barWidth = options.region.width / options.maxDotsCount;
}

volumePainter.prototype = {
    initialize: function (absPainter) {
        absPainter.options = this.options;
        absPainter.barWidth = this.barWidth;
        absPainter.spaceWidth = this.spaceWidth;
    },
    getDataLength: function () { return this.options.getDataLength.call(this); },
    getX: function (i) {
        return this.options.region.x + i * (this.barWidth + this.spaceWidth);
    },
    start: function () {
        var ctx = this.ctx;
        var options = this.options;
        var region = options.region;
        ctx.save();
        //×ª»»×ø±ê
        var maxVolume = 0;
        this.data.items.each(function (item) {
            maxVolume = Math.max(maxVolume, item.volume);
        });

        this.maxVolume = maxVolume;
        ctx.fillStyle = options.bar.color;
    },
    end: function () {
        this.ctx.restore();
    },
    getY: function (i) {
        var diff = this.options.region.y + (this.maxVolume - this.data.items[i].volume) * this.options.region.height / this.maxVolume;
        return diff;
    },
    paintItem: function (i, x, y) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.rect(x, y, this.barWidth, this.options.region.y + this.options.region.height - y);
        ctx.fill();
    }
};
/*
var ctx = canvas.getContext('2d');
var maxVolume = 0;

data.each(function (val, arr, i) {
    maxVolume = Math.max(maxVolume, val.volume);
});

function getY(v) { return canvas.height - canvas.height / maxVolume * v; }
function getX(i) { return i * (candleOptions.spaceWidth + candleOptions.barWidth) + (candleOptions.spaceWidth) * .5; }

data.each(function (val, arr, i) {
    var x = getX(i);
    var y = getY(val.volume);
    ctx.beginPath();
    ctx.rect(x, y, candleOptions.barWidth, canvas.height / maxVolume * val.volume);
    ctx.closePath();
    ctx.fillStyle = val.close > val.open ? riseColor : fallColor;
    ctx.fill();
});
*/
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
(function () {
    /*if (!Event.hasOwnProperty("fromElement") && Event.prototype.__defineGetter__) {
    Event.prototype.__defineGetter__("fromElement", function () {
    var node;
    if (this.type == "mouseover")
    node = this.relatedTarget;
    else if (this.type == "mouseout")
    node = this.target;
    if (!node) return;
    while (node.nodeType != 1) node = node.parentNode;
    return node;
    });
    Event.prototype.__defineGetter__("toElement", function () {
    var node;
    if (this.type == "mouseout")
    node = this.relatedTarget;
    else if (this.type == "mouseover")
    node = this.target;
    if (!node) return;
    while (node.nodeType != 1) node = node.parentNode;
    return node;
    });
    }*/

    function windowHelper() {
        this.tapTimeLimit = 500;
    }

    Array.prototype.each = function (func, startIndex, endIndex) {
        startIndex = startIndex || 0;
        endIndex = endIndex || this.length - 1;
        for (var i = startIndex; i <= endIndex; i++) {
            func(this[i], this, i);
            if (this.breakLoop) {
                this.breakLoop = false;
                break;
            }
        }
    };

    windowHelper.prototype = {
        preventDefaultEvent: function (ev) {
            if (ev.preventDefault) ev.preventDefault(); else ev.returnValue = false;
        },
        isTouchDevice: function () {
            return !!('ontouchstart' in window);
        },
        toMoney: function (val) {
            /*var pos = 2;
            return Math.round(val * Math.pow(10, pos)) / Math.pow(10, pos);*/
            return val.toFixed(2);
        },
        bigNumberToText: function (val) {
            var result;
            var yi = val / 100000000;
            if (yi > 1) {
                result = yi.toFixed(2) + 'ÒÚ';
            } else {
                var wan = val / 10000;
                if (wan > 1)
                    result = wan.toFixed() + 'Íò';
                else
                    result = val;
            }
            return result;
        },
        getOffset: function (e) {
            if (!isNaN(e.offsetX) && !isNaN(e.offsetY)) return e;
            var target = e.target;
            if (target.offsetLeft == undefined) {
                target = target.parentNode;
            }
            var pageCoord = getPageCoord(target);
            var eventCoord =
            {     //¼ÆËãÊó±êÎ»ÖÃ£¨´¥·¢ÔªËØÓë´°¿ÚµÄ¾àÀë£©
                x: window.pageXOffset + e.clientX,
                y: window.pageYOffset + e.clientY
            };
            var offset =
            {
                offsetX: eventCoord.x - pageCoord.x,
                offsetY: eventCoord.y - pageCoord.y
            };
            //e.offsetX = offset.offsetX;
            //e.offsetY = offset.offsetY;
            return offset;
        },
        getPageCoord: function (element)    //¼ÆËã´Ó´¥·¢µ½root¼äËùÓÐÔªËØµÄoffsetLeftÖµÖ®ºÍ¡£
        {
            var coord = { x: 0, y: 0 };
            while (element) {
                coord.x += element.offsetLeft;
                coord.y += element.offsetTop;
                element = element.offsetParent;
            }
            return coord;
        },
        addLoadEvent: function (f) {
            var old = window.onload;
            if (typeof old != 'function') window.onload = f;
            else { window.onload = function () { old(); f(); }; }
        },
        addEvent: function (elm, evType, fn, useCapture) {
            if (elm.addEventListener) {
                elm.addEventListener(evType, fn, useCapture);
                return true;
            }
            else if (elm.attachEvent) {
                var r = elm.attachEvent('on' + evType, fn);
                return r;
            }
            else {
                elm['on' + evType] = fn;
            }
        },
        getEventTarget: function (e) {
            return e.srcElement || e.target || e.relatedTarget;
        },
        $id: function (id) { return document.getElementById(id); }
    };

    window.extendObject = function (src, dest) {
        for (var f in src) {
            dest[f] = src[f];
        }
    };
    window.extendWindow = function (src) {
        extendObject(src, window);
    };
    var wh = new windowHelper();
    extendWindow(wh);
    window.getQueryParam = function (paramName, isTop) {
        var oRegex = new RegExp('[\?&]' + paramName + '=([^&]+)', 'i');
        var oMatch = oRegex.exec(isTop ? window.top.location.search : location.search);
        if (oMatch && oMatch.length > 1)
            return decodeURIComponent(oMatch[1]);
        else
            return '';
    };
    window.debug = getQueryParam('debug');
    window.setDebugMsg = function (msg) {
        if (window.debug) {
            try {
                var oid = 'debug';
                var o = $id(oid);
                if (!o) {
                    o = document.createElement('DIV');
                    o.id = oid;
                    document.body.appendChild(o);
                }
                o.innerHTML = (window.debug == 2 ? (msg + '<br/>' + o.innerHTML) : msg);
            } catch (err) {
                alert(msg + ';error:' + err);
            }
        }
    };
})();
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*Ê¹ÓÃ´ËÎÄ¼þÐèÒªÍ¬Ê±ÒýÓÃutil.js*/
/*
    options:{
        position:{x:false,y:33}, //positionÖÐµÄÖµÊÇÏà¶ÔÓÚcanvasµÄ×óÉÏ½ÇµÄ
        size:{width:150,height:200},
        opacity:80,
        cssClass:'',
        offsetToPoint:30,
        relativePoint:{x:15,y30},
        canvas:canvas,
        canvasRange:{x:1,y:2,width:200,height:100},
        innerHTML;'some text'
    }
*/
function Tip(options) {
    extendObject(options, this);
}

Tip.prototype = {
    getElementId: function () { return this.canvas.id + '_tip'; },
    _getRightLimit: function () { return this.canvasRange.x + this.canvasRange.width; },
    _getLeftLimit: function () { return this.canvasRange.x; },
    _getTopLimit: function () { return this.canvasRange.y; },
    _getBottomLimit: function () { return this.canvasRange.y + this.canvasRange.height; },
    show: function (relativePoint, html) {
        if (relativePoint) this.relativePoint = relativePoint;
        if (html) this.innerHTML = html;
        var otip = $id(this.getElementId());
        var size = this.size;
        var offset = this.offsetToPoint;
        var position = this.position;
        var relativePoint = this.relativePoint;

        var canvasPosition = getPageCoord(this.canvas);
        var y = position.y || relativePoint.y;
        var x = position.x || relativePoint.x;
        var tipX = 0;
        var tipY = 0;
        if (position.x) tipX = position.x;
        else {
            if (otip) {
                var currentX = parseInt(otip.style.left) - canvasPosition.x;
                //ÌáÊ¾¿òÔÚÊó±êµÄÓÒ±ß
                if (currentX > x) {
                    if (offset + x + size.width > this._getRightLimit()) {
                        currentX = x - offset - size.width;
                    } else {
                        currentX = x + offset;
                    }
                } else {
                    if (x - offset - size.width > this._getLeftLimit()) {
                        currentX = x - offset - size.width;
                    } else {
                        currentX = x + offset;
                    }
                }
                tipX = currentX;
            } else {
                tipX = x + offset;
                if (tipX > this._getRightLimit()) {
                    tipX = x - offset - size.width;
                }
            }
        }

        //yÖµ¹Ì¶¨
        if (position.y) tipY = position.y;
        else {
            if (otip) {
                var currentY = parseInt(otip.style.top) - canvasPosition.y;
                //ÌáÊ¾¿òÔÚÊó±êµÄÓÒ±ß
                if (currentY > y) {
                    if (offset + y + size.height > this._getBottomLimit()) {
                        currentY = y - offset - size.height;
                    } else {
                        currentY = y + offset;
                    }
                } else {
                    if (y - offset - size.height > this._getTopLimit()) {
                        currentY = y - offset - size.height;
                    } else {
                        currentY = y + offset;
                    }
                }
                tipY = currentY;
            } else {
                tipY = y + offset;
                if (tipY > this._getBottomLimit()) {
                    tipY = y - offset - size.height;
                }
            }
        }


        if (!otip) {
            otip = document.createElement('DIV');
            otip.id = this.getElementId();
            var opacity = this.opacity || 100;
            otip.style.cssText = '-moz-opacity:.' + opacity + '; filter:alpha(opacity='
                + opacity + '); opacity:' + (opacity / 100) + ';line-height:18px;font-family:Arial,"微軟正黑體";font-size:9pt;padding:4px;';
            otip.style.position = 'absolute';
            otip.style.zIndex = 4 + (this.canvas.style.zIndex || 1);
            otip.style.backgroundColor = 'white';
            otip.style.border = '1px solid gray';
            otip.style.width = this.size.width + 'px';
            otip.style.height = this.size.height + 'px';
            if (this.cssClass) otip.className = this.cssClass;
            document.body.appendChild(otip);
        }

        tipX = canvasPosition.x + tipX;
        tipY = canvasPosition.y + tipY;
        otip.style.left = tipX + 'px';
        otip.style.top = tipY + 'px';
            otip.style.display = 'block';
        otip.innerHTML = this.innerHTML;
    },
    hide: function () {
        var o = $id(this.getElementId());
        if (o) o.style.display = 'none';
    },
    update: function (relativePoint, html) {
        this.relativePoint = relativePoint;
        this.innerHTML = html;
        this.show();
    }
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
(function () {
    function painter() { }

    painter.prototype = {
        _clear: function (canvas) {
            this.ctxs[canvas.id].clearRect(0, 0, canvas.width, canvas.height);
        },

        _createLayer: function (options, clear) {
            if (!options.id) {
                alert('_createCanvas±ØÐëÖ¸¶¨id');
                return;
            }
            if (!this.layers) this.layers = {};
            if (!this.ctxs) this.ctxs = {};
            if (!this.drawOptions) this.drawOptions = {};
            if (this.layers[options.id]) {
                if (clear !== false) this._clear(this.layers[options.id]);
            } else {
                var z = this.maxZIndex++;
                var obj = document.createElement('canvas');
                obj.id = options.id;
                obj.style.position = 'absolute';
                obj.style.zIndex = z;
                obj.style.left = this.coords.x + options.left + 'px';
                obj.style.top = this.coords.y + options.top + 'px';
                obj.width = (options.width || (this.width - options.left));
                obj.height = (options.height || (this.height - options.top));
                if (this.debug && options.debug_backgroundColor) obj.style.backgroundColor = options.debug_backgroundColor;
                document.body.appendChild(obj);
                this.layers[options.id] = obj;
                this.ctxs[options.id] = obj.getContext('2d');
                this.drawOptions[options.id] = options;
            }
            return this.ctxs[options.id];
        },
        _drawRect: function (ctx, leftTopX, leftTopY, width, height, backgroundColor, borderWidth, borderColor, offsetX, offsetY) {
            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            ctx.beginPath();
            ctx.rect(leftTopX + offsetX, leftTopY + offsetY, width, height);
            ctx.lineWidth = borderWidth || 0;
            ctx.strokeStyle = borderColor;
            ctx.stroke();
        },
        _drawLine: function (ctx, leftTopX, leftTopY, rightBottomX, rightBottomY, color, width, offsetX, offsetY) {
            offsetX = offsetX || 0;
            offsetY = offsetY || 0;
            ctx.beginPath();
            var x0 = leftTopX + offsetX;
            var y0 = leftTopY + offsetY;
            var x1 = rightBottomX + offsetX;
            var y1 = rightBottomY + offsetY;
            var isH = (y0 == y1);
            var isV = (x0 == x1);
            if (isH) {
                if (y0 * 10 % 10 == 0) { y0 += .5; y1 += .5; }
            }
            if (isV) {
                if (x0 * 10 % 10 == 0) { x0 += .5; x1 += .5; }
            }
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = color || '#000000';
            ctx.lineWidth = width || 1;
            ctx.stroke();
        },
        _drawText: function (ctx, txt, x, y, font, color, align) {
            ctx.font = (font || '9pt ËÎÌå');
            ctx.textAlign = (align || 'left');
            ctx.fillStyle = (color || "Black");
            ctx.fillText(txt, x, y);
        },
        _measureText: function (ctx, txt, font) {
            if (font) ctx.font = font;
            var w = ctx.measureText(txt).width;
            return w;
        },

        _getLayer: function (name) {
            return this.layers[this.canvasId + '_' + name];
        },

        _getContext: function (name) {
            return this.ctxs[this.canvasId + '_' + name];
        },

        _getOptions: function (name) {
            return this.drawOptions[this.canvasId + '_' + name];
        }
    };
    window._painter = new painter();
})();
    
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
 /*
  html5 loading ¿Ø¼þ
  ×÷Õß£ºÓñ¿ª ²©¿Í£ºhttp://www.cnblogs.com/yukaizhao/
  ·¢²¼»òÊ¹ÓÃ´Ë¿Ø¼þ£¬Çë±£Áô×÷ÕßÉùÃ÷
  */
  function loading(canvas,options){
      this.canvas = (typeof canvas == 'String' ? document.getElementById(canvas) : canvas);
    if(options){
      this.radius = options.radius||10;
      this.circleLineWidth = options.circleLineWidth||4;
      this.circleColor = options.circleColor||'lightgray';
      this.dotColor = options.dotColor||'gray';
    }else{      
      this.radius = 10;
      this.circelLineWidth = 4;
      this.circleColor = 'lightgray';
      this.dotColor = 'gray';
    }
  }
  loading.prototype = {
    show:function (){
      var canvas = this.canvas;
      if(!canvas.getContext)return;
      if(canvas.__loading)return;
      canvas.__loading = this;
      var ctx = canvas.getContext('2d');
      var radius = this.radius;      
      var rotators = [{angle:0,radius:1.5},{angle:3/radius,radius:2},{angle:7/radius,radius:2.5},{angle:12/radius,radius:3}];      
      var me = this;
      canvas.loadingInterval = setInterval(function(){
        ctx.clearRect(0,0,canvas.width,canvas.height);         
        var lineWidth = me.circleLineWidth;
        var center = {x:canvas.width/2 - radius,y:canvas.height/2-radius};          
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = me.circleColor;
        ctx.arc(center.x,center.y,radius,0,Math.PI*2);
        ctx.closePath();
        ctx.stroke();
        for(var i=0;i<rotators.length;i++){        
          var rotatorAngle = rotators[i].currentAngle||rotators[i].angle;            
          //ÔÚÔ²È¦ÉÏÃæ»­Ð¡Ô²
          var rotatorCenter = {x:center.x-(radius)*Math.cos(rotatorAngle) ,y:center.y-(radius)*Math.sin(rotatorAngle)};            
          var rotatorRadius = rotators[i].radius;
          ctx.beginPath();
          ctx.fillStyle = me.dotColor;
          ctx.arc(rotatorCenter.x,rotatorCenter.y,rotatorRadius,0,Math.PI*2);
          ctx.closePath();
          ctx.fill();
          rotators[i].currentAngle = rotatorAngle+4/radius;
        }
      },50);
    },
    hide:function(){
      var canvas = this.canvas;
      canvas.__loading = false;
      if(canvas.loadingInterval){
        window.clearInterval(canvas.loadingInterval);
      }
      var ctx = canvas.getContext('2d');
      if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  };
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('o C(a,b){6.z=a;m(b){6.9=b.9||12;6.w=b.w||4;6.n=b.n||\'A\';6.p=b.p||\'E\'}T{6.9=12;6.S=4;6.n=\'A\';6.p=\'E\'}}C.Q={N:o(){8 f=6.z;m(!f.u)H;m(f.v)H;f.v=6;8 g=f.u(\'K\');8 h=6.9;8 j=[{l:0,9:1.5},{l:3/h,9:2},{l:7/h,9:2.5},{l:12/h,9:3}];8 k=6;f.r=L(o(){g.I(0,0,f.s,f.t);8 a=k.w;8 b={x:f.s/2-h,y:f.t/2-h};g.B();g.14=a;g.W=k.n;g.D(b.x,b.y,h,0,q.F*2);g.G();g.O();P(8 i=0;i<j.R;i++){8 c=j[i].J||j[i].l;8 d={x:b.x-(h)*q.U(c),y:b.y-(h)*q.V(c)};8 e=j[i].9;g.B();g.X=k.p;g.D(d.x,d.y,e,0,q.F*2);g.G();g.Y();j[i].J=c+4/h}},Z)},10:o(){8 a=6.z;a.v=11;m(a.r){13.M(a.r)}8 b=a.u(\'K\');m(b)b.I(0,0,a.s,a.t)}};',62,67,'||||||this||var|radius||||||||||||angle|if|circleColor|function|dotColor|Math|loadingInterval|width|height|getContext|__loading|circleLineWidth|||canvas|lightgray|beginPath|loading|arc|gray|PI|closePath|return|clearRect|currentAngle|2d|setInterval|clearInterval|show|stroke|for|prototype|length|circelLineWidth|else|cos|sin|strokeStyle|fillStyle|fill|50|hide|false||window|lineWidth'.split('|'),0,{}))
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*
options = {
  region:{x:10,y:10,width:300,height:200},
  maxDotsCount:241,
  getDataLength:function(){},
  getItemValue:function(item){return item.price;},
  middleValue: 10.4, //Í¨³£ÊÇ×òÊÕ
  color:'blue'
}
*/
function linePainter(options){
  this.options = options;
}

linePainter.prototype = {
    initialize:function(absPainter){
      absPainter.options  = this.options;
    },
    getDataLength:function(){return this.options.getDataLength.call(this);},
    getX: function (i) {
        return (i + 1) * (this.options.region.width / this.options.maxDotsCount);
    },
    start: function () {
        var ctx = this.ctx;
        var options = this.options;
        var region = options.region;
        ctx.save();
        //×ª»»×ø±ê
        ctx.translate(region.x, region.y + region.height / 2);


        var maxDiff = 0;
        var me = this;
        
        this.data.items.each(function (item) {
            var diff = Math.abs(options.middleValue - options.getItemValue(item));
            maxDiff = Math.max(diff, maxDiff);
        });

        this.maxDiff = maxDiff;
        ctx.beginPath();
        ctx.strokeStyle = options.lineColor;
    },
    end: function () {
        this.ctx.stroke();
        this.ctx.restore();
    },
    getY: function (i) {
        var options = this.options; 
        var diff =options.getItemValue(this.data.items[i]) - options.middleValue;
        return 0 - diff * options.region.height / 2 / this.maxDiff; 
    },
    paintItem: function (i, x, y) {
        var ctx = this.ctx;

        if (i == 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*ÔÚÖ¸¶¨ÇøÓòÄÚÏÔÊ¾½»²æÏß
* ´ËÎÄ¼þÒÀÀµÓÚ util.js
*/
/*
var crossLinesOptions = {
    crossPoint: { x: getCandleLineX(index)+canvasPosition.x, y: ev.offsetY },
    verticalRange: { y1: 0, y2: canvasVolume.height + getPageCoord(canvasVolume).y - getPageCoord(canvas).y },
    horizontalRange: false,
    color: '#69c',
    canvas: canvas
};
              
var clsMgr = new crossLines(crossLinesOptions);
clsMgr.setMouseEvents(function(evl){
	evl = evl||event;
	getOffset(evl);				
					
	var kDataIndex = Math.ceil(evl.offsetX / (candleOptions.barWidth + candleOptions.spaceWidth)) - 1;
	if(kDataIndex >= 0 && kDataIndex < filteredData.length){
		canvas.crossLines.getHLine().style.top = evl.pageY + 'px';
		canvas.crossLines.getVLine().style.left = getCandleLineX(kDataIndex)+canvasPosition.x+'px';
		//showTip(canvas, kDataIndex, filteredData[kDataIndex]);
	}
},null);
              
//draw crossLine
clsMgr.drawCrossLines();
canvas.crossLines = clsMgr;
*/
function crossLines(options) {
    this.updateOptions(options);
}

crossLines.prototype = {
    updateOptions: function (options) {
        this.canvas = options.canvas;
        this.canvasId = this.canvas.id;
        this.horizontalDivId = this.canvasId + '_crossLines_H';
        this.verticalDivId = this.canvasId + '_crossLines_V';
        this.verticalRange = options.verticalRange || { y1: 0, y2: this.canvas.height };
        this.horizontalRange = options.horizontalRange || { x1: 0, x2: this.canvas.width };
        this.canvasPosition = getPageCoord(this.canvas);
        this.crossPoint = options.crossPoint;
        this.color = options.color || 'black';
    },
    removeCrossLines: function () {
        var canvas = this.canvas;
        var canvasId = canvas.id;
        var horizontalDivId = canvasId + '_crossLines_H';
        var verticalDivId = canvasId + '_crossLines_V';
        var lineX = $id(horizontalDivId);
        if (lineX) lineX.style.display = 'none';
        var lineY = $id(verticalDivId);
        if (lineY) lineY.style.display = 'none';
    },

    getHLine: function () {
        return $id(this.horizontalDivId);
    },
    getVLine: function () {
        return $id(this.verticalDivId);
    },
    setMouseEvents: function (evtForHLine, evtForVLine) {
        this.hLineMouseEvt = evtForHLine;
        this.vLineMouseEvt = evtForVLine;
    },
    updateCrossPoint: function (point) {
        this.crossPoint = point;
        this.drawCrossLines();
    },
    drawCrossLines: function () {
        var canvas = this.canvas;
        var canvasId = this.canvas.id;
        var horizontalDivId = canvasId + '_crossLines_H';
        var verticalDivId = canvasId + '_crossLines_V';
        var vertialRange = this.verticalRange || { y1: 0, y2: canvas.height };
        var horizontalRange = this.horizontalRange || { x1: 0, x2: canvas.width };
        var canvasPosition = this.canvasPosition;

        //ÅÐ¶ÏÊÇ·ñ³¬³öË®Æ½ºÍ´¹Ö±·¶Î§£¬Èç¹û³¬³ö·¶Î§ÔòÒªÒþ²ØÏß
        if (this.crossPoint.x < horizontalRange.x1
            || this.crossPoint.x > horizontalRange.x2
            || this.crossPoint.y < vertialRange.y1
            || this.crossPoint.y > vertialRange.y2) {
            this.removeCrossLines();
            return;
        }


        var zIndex = (canvas.style.zIndex || 1) + 1;
        //»­Ë®Æ½Ïß
        var exists = false;
        var hLine;
        if ($id(horizontalDivId)) {
            exists = true;
            hLine = $id(horizontalDivId);
        }
        else {
            hLine = document.createElement('DIV');
            hLine.id = horizontalDivId;
        }
        hLine.style.display = 'block';
        hLine.style.position = 'absolute';
        hLine.style.width = Math.round(horizontalRange.x2 - horizontalRange.x1) + 'px';
        hLine.style.height = '1px';
        hLine.style.left = Math.round(canvasPosition.x + horizontalRange.x1) + 'px';
        hLine.style.top = Math.round(this.crossPoint.y + canvasPosition.y) + 'px';
        hLine.style.backgroundColor = this.color;
        hLine.style.zIndex = zIndex;
        if (!exists) {
            document.body.appendChild(hLine);
            if (typeof this.hLineMouseEvt == 'function') {
                addEvent(hLine, 'mouseover', this.hLineMouseEvt);
                addEvent(hLine, 'mousemove', this.hLineMouseEvt);
            }
        }


        //»­´¹Ö±Ïß
        exists = false;
        var vLine;
        if ($id(verticalDivId)) {
            exists = true;
            vLine = $id(verticalDivId);
        }
        else {
            vLine = document.createElement('DIV');
            vLine.id = verticalDivId;
        }


        vLine.style.display = 'block';
        vLine.style.position = 'absolute';
        vLine.style.height = Math.round(vertialRange.y2 - vertialRange.y1) + 'px';
        vLine.style.width = '1px';
        vLine.style.left = Math.round(this.crossPoint.x + canvasPosition.x) + 'px';
        vLine.style.top = Math.round(vertialRange.y1 + canvasPosition.y) + 'px';
        vLine.style.backgroundColor = this.color;
        vLine.style.zIndex = zIndex;
        if (!exists) {
            document.body.appendChild(vLine);
            if (typeof this.vLineMouseEvt == 'function') {
                addEvent(vLine, 'mouseover', this.vLineMouseEvt);
                addEvent(vLine, 'mousemove', this.vLineMouseEvt);
            }
        }
    }
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
function getCookie( name ) {
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;
	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
		return null;
	}
	if(start == -1) return null;
	var end = document.cookie.indexOf( ";", len );
	if ( end == -1 ) end = document.cookie.length;
	return unescape( document.cookie.substring( len, end ) );
}
var COOKIE_EXPIRES = 0;
//expires£ºÒÔÌìÎªµ¥Î»
function setCookie( name, value, expires, path, domain, secure) {
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) {
		expires = expires * 1000 * 60 * 60 * 24;
	}else{
		expires = COOKIE_EXPIRES * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );
	document.cookie = name+"="+escape( value ) +
		( ( expires ) ? ";expires="+expires_date.toGMTString() : "" ) + 
		( ( path ) ? ";path=" + (path||'/') :"") +
		( ( domain ) ? ";domain=" + (domain||location.hostname) : '') +
		( ( secure ) ? ";secure" : "" );
}
	
function deleteCookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + "=" +
			( ( path ) ? ";path=" + path : ";path=" + '/') +
			( ( domain ) ? ";domain=" + domain : "") +
			";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
  function controller(canvasId, options) {
      this.canvas = $id(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.region = options.region;
      this.bar = options.bar;
      this.value = options.value;
      //if (this.value) {console.log('this.value is{left:' + this.value.left + ',right:' + this.value.right + ')');}
      this.minBarDistance = options.minBarDistance || 5;
      this.onPositionChanged = options.onPositionChanged;
      this.prePaint = options.prePaint;
      this.isTouchDevice = isTouchDevice();
      this.touchFaultTolerance = options.touchFaultTolerance;
  }

  controller.prototype =
  {
      calcPositions: function () {
          var width = (this.region.width - this.bar.width);
          this.leftBarPosition = this.value.left * width / 100 + this.bar.width / 2;
          this.rightBarPosition = this.value.right * width / 100 + this.bar.width / 2;
      },
      drawControllerPart: function () {
          var canvas = this.canvas;
          var ctx = this.ctx;
          ctx.save();
          var region = this.region;
          var bar = this.bar;
          this.calcPositions();
          var leftBarPosition = this.leftBarPosition;
          var rightBarPosition = this.rightBarPosition;

          ctx.clearRect(region.x - 1, region.y - 1, region.width + 1, region.height + 1);

          if (typeof this.prePaint == 'function') {
              this.prePaint(ctx);
          }

          //setDebugMsg(leftBarPosition, 'Left');
          // »­Ïß·½Ê½»­³öÀ´µÄÏßÌ«´ÖÁË
          ctx.lineWidth = 1;
          ctx.strokeStyle = region.borderColor;
          ctx.beginPath();
          ctx.moveTo(region.x, region.y);
          ctx.lineTo(region.x, region.y + region.height);
          ctx.lineTo(region.x + leftBarPosition, region.y + region.height);
          ctx.lineTo(region.x + leftBarPosition, region.y + region.height - (region.height - bar.height) / 2);
          ctx.stroke();

          ctx.strokeStyle = region.borderColor;
          ctx.beginPath();
          ctx.moveTo(region.x + leftBarPosition, region.y + region.height / 2 - bar.height / 2);
          ctx.lineTo(region.x + leftBarPosition, region.y);
          ctx.lineTo(region.x, region.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(region.x + leftBarPosition, region.y + region.height);
          ctx.lineTo(region.x + region.width, region.y + region.height);
          ctx.lineTo(region.x + region.width, region.y);
          ctx.lineTo(region.x + rightBarPosition, region.y);
          ctx.lineTo(region.x + rightBarPosition, region.y + region.height / 2 - bar.height / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(region.x + rightBarPosition, region.y + region.height / 2 + bar.height / 2);
          ctx.lineTo(region.x + rightBarPosition, region.y + region.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = 'blue';
          ctx.globalAlpha = .5;
          ctx.rect(region.x + leftBarPosition, region.y, rightBarPosition - leftBarPosition, region.height);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;

          //»­×ó²àÐ¡¾ØÐÎ¿ò
          ctx.strokeStyle = bar.borderColor;
          ctx.fillStyle = bar.fillColor;
          ctx.beginPath();
          var leftBarRegion = { x: region.x + leftBarPosition - bar.width / 2, y: region.y + region.height / 2 - bar.height / 2, width: bar.width, height: bar.height };
          ctx.rect(leftBarRegion.x, leftBarRegion.y, leftBarRegion.width, leftBarRegion.height);
          this.leftBarRegion = leftBarRegion;
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          //»­ÓÒ²àÐ¡¾ØÐÎ
          ctx.beginPath();
          var rightBarRegion = { x: region.x + rightBarPosition - bar.width / 2, y: region.y + region.height / 2 - bar.height / 2, width: bar.width, height: bar.height };
          ctx.rect(rightBarRegion.x, rightBarRegion.y, rightBarRegion.width, rightBarRegion.height);
          this.rightBarRegion = rightBarRegion;
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          ctx.restore();
      },

      setLeftBarPosition: function (x) {
          if (x < this.bar.width / 2) this.leftBarPosition = this.bar.width / 2;
          else if (this.rightBarPosition - x - this.minBarDistance > this.bar.width)
              this.leftBarPosition = x;
          else
              this.leftBarPosition = this.rightBarPosition - this.bar.width - this.minBarDistance;
          this.value = this.getValue();
      },
      setRightBarPosition: function (x) {
          if (x < this.leftBarPosition + this.bar.width + this.minBarDistance) this.rightBarPosition = this.leftBarPosition + this.bar.width + this.minBarDistance;
          else if (x > this.region.width - this.bar.width / 2) this.rightBarPosition = this.region.width - this.bar.width / 2;
          else this.rightBarPosition = x;
          this.value = this.getValue();
      },
      addControllerEvents: function () {
          var me = this;
          if (me.isTouchDevice) {
              var canvas = me.canvas;
              addEvent(canvas, 'touchmove', function (e) {
                  e = e || event;
                  var src = e.srcElement || e.target || e.relatedTarget;

                  var touches = e.touches;
                  if (!touches || !touches.length) return;
                  var changed = false;
                  var canvasPosition = getPageCoord(this.canvas);
                  if (me.fingers && me.fingers.length) {
                      for (var i = 0; i < me.fingers.length; i++) {
                          var finger = me.fingers[i];

                          for (var j = 0; j < touches.length; j++) {
                              var touch = touches[j];
                              if (touch.identifier == finger.id) {
                                  var currentX = touch.pageX - canvasPosition.x;

                                  var moveLength = (currentX - finger.startX);
                                  if (moveLength != 0) {
                                      if (finger.type == 'left') {
                                          me.setLeftBarPosition(finger.leftPosition + moveLength);
                                      } else if (finger.type == 'right') {
                                          me.setRightBarPosition(finger.rightPosition + moveLength);
                                      } else {
                                          me.setLeftBarPosition(finger.leftPosition + moveLength);
                                          me.setRightBarPosition(finger.rightPosition + moveLength);
                                      }
                                      changed = true;
                                  }
                                  break;
                              }
                          }
                      }
                  }
                  if (changed) {
                      me.drawControllerPart();
                      //setDebugMsg('changed='+changed+',me.isValueChanged()=' + me.isValueChanged() + ',me.value=' + me.getValue());
                      if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                          me.value = me.getValue();

                          me.onPositionChanged(me.value);
                      }
                  }
                  disableBubbleAndPreventDefault(e);
              });
              addEvent(canvas, 'touchend', function (e) {
                  e = e||event;
                  //setDebugMsg('enter touchend me.fingers.length='+me.fingers.length);
                  if(me.fingers&&me.fingers.length){
                    if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                        me.value = me.getValue();
                        me.onPositionChanged(me.value);
                    }
                  }else{
                    var timeSpan = new Date().getTime() - me.touchstartTime.getTime();
                    //setDebugMsg('timeSpan='+timeSpan);
                    if(timeSpan < window.tapTimeLimit && me.startTouch){
                        var canvasPosition = getPageCoord(me.canvas);
                        var evt = me.startTouch;
                        var point = { offsetX: evt.pageX - canvasPosition.x, offsetY: evt.pageY - canvasPosition.y };                        
                        var centerX = (me.rightBarPosition+me.leftBarPosition)/2;
                        var moveLength = point.offsetX - centerX;
                        /*
                        setDebugMsg('evt.pageX='+evt.pageX+',centerX='+centerX+',point.offsetX='+point.offsetX+',moveLength='+moveLength);
                        setDebugMsg('me.leftBarPosition+moveLength=' +(me.leftBarPosition+moveLength) 
                          + ',me.rightBarPosition+moveLength=' +(me.rightBarPosition+moveLength));
                          */
                        me.setLeftBarPosition(me.leftBarPosition+moveLength);
                        me.setRightBarPosition(me.rightBarPosition+moveLength);
                        me.drawControllerPart();
                        //setDebugMsg('changed='+changed+',me.isValueChanged()=' + me.isValueChanged() + ',me.value=' + me.getValue());
                        if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                            me.value = me.getValue();

                            me.onPositionChanged(me.value);
                        }
                        me.startTouch = null;
                    }
                  }
                  me.fingers=null;
                  disableBubbleAndPreventDefault(e);
              });
              addEvent(canvas, 'touchstart', function (e) {
                  var touches = e.touches;
                  if (!touches || !touches.length) touches = e.changedTouches;
                  me.touchstartTime = new Date();
                  me.startTouch = touches[0];
                  var src = e.srcElement || e.target || e.relatedTarget;

                  var canvasPosition = getPageCoord(me.canvas);
                  function getTouchType(point) {
                      if (me.isOnLeftBar(point)) return 'left';
                      if (me.isOnRightBar(point)) return 'right';
                      if (me._isBetweenLeftAndRight(point)) return 'middle';
                      return false;
                  }

                  me.fingers = [];
                  if (touches.length) {
                      for (var i = 0; i < touches.length; i++) {
                          var touch = touches[i];
                          var point = { offsetX: touch.pageX - canvasPosition.x, offsetY: touch.pageY - canvasPosition.y };
                          var touchSection = getTouchType(point);
                          if (!touchSection) continue;

                          var finger = {
                              id: touch.identifier,
                              startX: touch.pageX - canvasPosition.x,
                              type: touchSection,
                              leftPosition: me.leftBarPosition,
                              rightPosition: me.rightBarPosition
                          };
                          me.fingers.push(finger);
                      }
                  }

                  disableBubbleAndPreventDefault(e);
                  return false;
              });
          } else {
              var moveHandle = function (ev) {
                  var isOnLeftBar = me.isOnLeftBar(ev);
                  var isOnRightBar = me.isOnRightBar(ev);
                  if (me._isBetweenLeftAndRight(ev)) {
                      document.body.style.cursor = 'pointer';
                  } else if (isOnLeftBar || isOnRightBar || me.triggerBar) {
                      document.body.style.cursor = 'col-resize';
                  }
                  else {
                      document.body.style.cursor = 'default';
                  }
                  if (me.triggerBar) {
                      me.triggerBar.targetX = ev.offsetX;
                      var moveLength = (me.triggerBar.targetX - me.triggerBar.x);
                      if (me.triggerBar.type == 'left') {
                          document.body.style.cursor = 'col-resize';
                          me.setLeftBarPosition(me.triggerBar.position + moveLength);
                      } else if (me.triggerBar.type == 'right') {
                          me.setRightBarPosition(me.triggerBar.position + moveLength);
                      } else {
                          me.setLeftBarPosition(me.triggerBar.leftPosition + moveLength);
                          me.setRightBarPosition(me.triggerBar.rightPosition + moveLength);
                      }

                      if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                          me.value = me.getValue();
                          me.onPositionChanged(me.value);
                      }
                      me.drawControllerPart();
                  }
              };
              var endMove = function (ev) {
                  if (me.triggerBar) {
                  }
                  me.triggerBar = null;
                  document.body.style.cursor = 'default';
                  if (typeof me.onPositionChanged == 'function' && me.isValueChanged()) {
                      me.value = me.getValue();
                      me.onPositionChanged(me.value);
                      //console.log('me.onPositionChanged(me.value) me.value is {left:' + me.value.left + ',right:' + me.value.right + '}');
                  }
              };

              var startHandle = function (ev) {
                  var isOnLeftBar = me.isOnLeftBar(ev);
                  var isOnRightBar = me.isOnRightBar(ev);
                  var isOnMiddle = me._isBetweenLeftAndRight(ev);
                  if (isOnMiddle) {
                      document.body.style.cursor = 'pointer';
                  } else if (isOnLeftBar || isOnRightBar) {
                      document.body.style.cursor = 'col-resize';
                  }
                  else {
                      document.body.style.cursor = 'default';
                  }

                  if (isOnLeftBar) me.triggerBar = { type: 'left', x: ev.offsetX, position: me.leftBarPosition };
                  else if (isOnRightBar) me.triggerBar = { type: 'right', x: ev.offsetX, position: me.rightBarPosition };
                  else if (isOnMiddle) me.triggerBar = { type: 'middle', x: ev.offsetX, leftPosition: me.leftBarPosition, rightPosition: me.rightBarPosition };
                  else me.triggerBar = null;

              };
              addEvent(me.canvas, 'mouseup', endMove);
              addEvent(me.canvas, 'mouseout', endMove);
              addEvent(me.canvas, 'mousemove', function (ev) {
                  ev = ev || event;
                  if (ev.preventDefault) ev.preventDefault();
                  else ev.returnValue = false;
                  var point = getOffset(ev);
                  moveHandle(point);
              });
              addEvent(me.canvas, 'mousedown', function (ev) {
                  ev = ev || event;
                  var point = getOffset(ev);
                  startHandle(point);
              });
          }
      },
      isValueChanged: function () {
          if (typeof this.preValue == 'undefined') {
              this.preValue = this.getValue();
              return false;
          }

          if (isTouchDevice() && this.latestChangeTime) {
              var now = new Date();
              if (now.getTime() - this.latestChangeTime.getTime() < 50) return false;
          }
          var preValue = this.preValue;
          var value = this.getValue();
          var changed = Math.abs(value.left - preValue.left) + Math.abs(value.right - preValue.right);
          this.preValue = value;
          var result = changed != 0;
          if (result) {
              this.latestChangeTime = new Date();
          }
          return changed != 0;
      },
      _isInRegion: function (ev, region) {
          return ev.offsetX > region.x && ev.offsetX < region.x + region.width
            && ev.offsetY > region.y && ev.offsetY < region.y + region.height;
      },

      _isBetweenLeftAndRight: function (ev) {
          var region = this.region;
          var middleRegion = {
              x: region.x + this.leftBarPosition + this.bar.width / 2,
              y: region.y,
              width: this.rightBarPosition - this.leftBarPosition - this.bar.width,
              height: this.region.height
          };
          return this._isInRegion(ev, middleRegion);
      },
      _getTouchFaultToleranceRegion: function (region) {
          var me = this;
          if (me.isTouchDevice) {
              region.x -= me.touchFaultTolerance / 2;
              region.width += me.touchFaultTolerance / 2;
          }
          return region;
      },
      isOnLeftBar: function (ev) {
          var region = this._getTouchFaultToleranceRegion(this.leftBarRegion);

          return this._isInRegion(ev, region);
      },
      isOnRightBar: function (ev) {
          var region = this._getTouchFaultToleranceRegion(this.rightBarRegion);
          return this._isInRegion(ev, region);
      },
      getValue: function () {
          var totalLength = this.region.width - this.bar.width;
          return {
              left: (this.leftBarPosition - this.bar.width / 2) * 100 / totalLength,
              right: (this.rightBarPosition - this.bar.width / 2) * 100 / totalLength
          };
      }
  };
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*Ê¹ÓÃ´ËÎÄ¼þÐèÒªÒýÓÃutil.jsºÍcrossLineÒÔ¼°tip*/
/*
    canvas: Ìí¼ÓÊÂ¼þµÄ»­²¼
    options: {
        getCrossPoint:function (ev){return {x:x,y:y};},
        triggerEventRanges:{},
        tipOptions{
            tipHtml:function(ev){}
        },
        crossLineOptions:{
            color:'red'
        }
    }
*/
function disableBubbleAndPreventDefault(e) {
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
}

function setTouchEventOffsetPosition(e, relativePoint) {
    e = e || event;
    if (e.touches && e.touches.length) {
        e = e.touches[0];
    } else if (e.changedTouches && e.changedTouches.length) {
        e = e.changedTouches[0];
    }
    
    var offsetX, offsetY;
    offsetX = e.pageX - relativePoint.x;
    offsetY = e.pageY - relativePoint.y;
    return { offsetX: offsetX, offsetY: offsetY };
}

function crossLinesAndTipMgr(canvas, options) {
    if (typeof Tip != 'function') {
        window.Tip = function () { };
        window.Tip.prototype = { show: function () { }, hide: function () { }, update: function () { } };
    }
    this.canvas = canvas;
    this.options = options;
}

crossLinesAndTipMgr.prototype._removeTipAndCrossLines = function () {
    //var canvas = this.canvas;
    var me = this;
    if (me.tip) me.tip.hide();
    if (me.clsMgr) me.clsMgr.removeCrossLines();
};
crossLinesAndTipMgr.prototype.updateOptions = function (options) {
    this.options = options;
};
crossLinesAndTipMgr.prototype._onMouseOrTouchMove = function (ev) {
    ev = ev || event;
    ev = getOffset(ev);
    var me = this;
    var options = me.options;
    var canvas = me.canvas;
    var canvasPosition = getPageCoord(canvas);
    var range = options.triggerEventRanges;

    //ÅÐ¶ÏÊÇ·ñÔÚ·¶Î§Ö®ÄÚ£¬Èç¹û²»ÔÚ·¶Î§Ö®ÄÚÔòÒÆÈ¥Ê®×ÖÏßºÍtip
    if (ev.offsetX < range.x || ev.offsetX > range.x + range.width
            || ev.offsetY < range.y || ev.offsetY > range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var crossPoint = options.getCrossPoint(ev);

    //Ìí¼ÓÊó±êºÍ´¥ÃþEvent
    var crossLinesOptions = {
        crossPoint: crossPoint,
        verticalRange: { y1: range.y, y2: range.y + range.height },
        horizontalRange: { x1: range.x, x2: range.x + range.width },
        color: options.crossLineOptions.color,
        canvas: canvas
    };
    if (!me.clsMgr) {
        var clsMgr = new crossLines(crossLinesOptions);
        clsMgr.setMouseEvents(function (evHLine) {
            evHLine = evHLine || event;
            evHLine = getOffset(evHLine);
            var translatedEv = { offsetX: evHLine.offsetX + range.x, offsetY: parseInt(me.clsMgr.getHLine().style.top) - canvasPosition.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        }, function (evl) {
            evl = evl || event;
            evl = getOffset(evl);
            var translatedEv = { offsetX: parseInt(me.clsMgr.getVLine().style.left) - canvasPosition.x, offsetY: evl.offsetY + range.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        });

        me.clsMgr = clsMgr;
    } else {
        me.clsMgr.updateOptions(crossLinesOptions);
    }
    me.clsMgr.drawCrossLines();
    if (options.tipOptions) {
        var tipOp = options.tipOptions;
        if (!me.tip) {
            //tipÉèÖÃ
            var tip = new Tip({
                position: { x: tipOp.position.x || false, y: tipOp.position.y || false }, //positionÖÐµÄÖµÊÇÏà¶ÔÓÚcanvasµÄ×óÉÏ½ÇµÄ
                size: tipOp.size,
                opacity: tipOp.opacity || 80,
                cssClass: tipOp.cssClass,
                offsetToPoint: tipOp.offsetToPoint || 30,
                relativePoint: { x: crossPoint.x, y: crossPoint.y },
                canvas: canvas,
                canvasRange: options.triggerEventRanges,
                innerHTML: tipOp.getTipHtml(ev)
            });
            me.tip = tip;
        }
console.log("crossPoint");
        me.tip.show(crossPoint, tipOp.getTipHtml(ev));
    }
};

crossLinesAndTipMgr.prototype._touchstart = function (e) {
    e = e || event;
    var src = e.srcElement || e.target || e.relatedTarget;
    this.touchstartTime = new Date();
};
crossLinesAndTipMgr.prototype._touchmove = function (e) {
    e = e || event;

    var canvas = this.canvas;

    var relativePoint = getPageCoord(canvas);
    var src = e.srcElement || e.target || e.relatedTarget;
    var fixedEvt = setTouchEventOffsetPosition(e, relativePoint);

    this._onMouseOrTouchMove(fixedEvt);
};

crossLinesAndTipMgr.prototype._touchend = function (e) {
    e = e || event;
    var src = e.srcElement || e.target || e.relatedTarget;
    var canvas = this.canvas;
    var fixedEvt = setTouchEventOffsetPosition(e, getPageCoord(canvas));
    this._removeTipAndCrossLines();

    var time = new Date();
    var ts = time.getTime() - this.touchstartTime.getTime();
    if (ts < 200) {
        if (typeof this.options.onClick == 'function') this.options.onClick();
    }
};
crossLinesAndTipMgr.prototype._mouseout = function (ev) {
    var e = ev || event;
    ev = getOffset(e);
    var me = this;
    var range = me.options.triggerEventRanges;
    //ÅÐ¶ÏÊÇ·ñÔÚ·¶Î§Ö®ÄÚ£¬Èç¹û²»ÔÚ·¶Î§Ö®ÄÚÔòÒÆÈ¥Ê®×ÖÏßºÍtip
    if (ev.offsetX <= range.x || ev.offsetX >= range.x + range.width
            || ev.offsetY <= range.y || ev.offsetY >= range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var toEle = e.toElement || e.relatedTarget || e.target;
    
    if (toEle) {
        if (toEle == me.canvas) return;
        if (toEle == me.clsMgr.getHLine() || toEle == me.clsMgr.getVLine()) return;
        me._removeTipAndCrossLines();
    }
};

crossLinesAndTipMgr.prototype.addCrossLinesAndTipEvents = function () {
    var canvas = this.canvas;
    var options = this.options;
    var canvasPosition = getPageCoord(canvas);
    if (canvas.addCrossLinesAndTipEvents == true) return;
    canvas.addCrossLinesAndTipEvents = true;

    var touchable = isTouchDevice();
    var me = this;
    var controllerEvts = me.options.controllerEvents;
    if (touchable) {
        addEvent(canvas, 'touchstart', function (ev) {
            ev = ev || event;
            disableBubbleAndPreventDefault(ev);
            if (me.options.shouldDoControllerEvent(ev,'touchstart')) {
                controllerEvts.onStart(ev);
            }
            else {
                me._touchstart.call(me, ev);
            }
        });

        addEvent(canvas, 'touchmove', function (ev) {
            ev = ev || event;
            disableBubbleAndPreventDefault(ev);
            if (me.options.shouldDoControllerEvent(ev,'touchmove')) {
                controllerEvts.onMove(ev);
            } else {
                me._touchmove.call(me, ev);
            }
        });

        addEvent(canvas, 'touchend', function (ev) {
            ev = ev || event;
            disableBubbleAndPreventDefault(ev);
            if (me.options.shouldDoControllerEvent(ev,'touchend')) {
                controllerEvts.onEnd(ev);
            }
            me._touchend.call(me, ev);
        });
    }
    else {
        //me.controllerMode = location.href.indexOf('controllerMode') > 0;

        addEvent(canvas, 'mouseout', function (ev) {
            if (me.options.shouldDoControllerEvent(ev)) {
                controllerEvts.onEnd(ev);
            } else {
                me._mouseout.call(me, ev);
            }
        });

        addEvent(canvas, 'mousemove', function (ev) {
            if (me.options.shouldDoControllerEvent(ev)) {
                controllerEvts.onMove(ev);
            } else {
                me._onMouseOrTouchMove.call(me, ev);
            }
        });

        addEvent(canvas, 'mousedown', function (ev) {
            if (me.options.shouldDoControllerEvent(ev)) {
                controllerEvts.onStart(ev);
            }
        });

        addEvent(canvas, 'mouseup', function (ev) {
            //me.controllerMode = false;
            controllerEvts.onEnd(ev);
        });

        if (typeof options.onClick == 'function') {
            addEvent(canvas, 'click', options.onClick);
        }
    }
};

function addCrossLinesAndTipEvents(canvas, options) { 
    if(!canvas.crossLineAndTipMgrInstance){
        canvas.crossLineAndTipMgrInstance = new crossLinesAndTipMgr(canvas, options);
        canvas.crossLineAndTipMgrInstance.addCrossLinesAndTipEvents();
    }
}
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*Ê¹ÓÃ´ËÎÄ¼þÐèÒªÒýÓÃutil.jsºÍcrossLineÒÔ¼°tip*/
/*
    canvas: Ìí¼ÓÊÂ¼þµÄ»­²¼
    options: {
        getCrossPoint:function (ev){return {x:x,y:y};},
        triggerEventRanges:{},
        tipOptions{
            tipHtml:function(ev){}
        },
        crossLineOptions:{
            color:'red'
        }
    }
*/
function disableBubbleAndPreventDefault(e) {
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
}

function setTouchEventOffsetPosition(e, relativePoint) {
    e = e || event;
    if (e.touches && e.touches.length) {
        e = e.touches[0];
    } else if (e.changedTouches && e.changedTouches.length) {
        e = e.changedTouches[0];
    }
    
    var offsetX, offsetY;
    offsetX = e.pageX - relativePoint.x;
    offsetY = e.pageY - relativePoint.y;
    return { offsetX: offsetX, offsetY: offsetY };
}

function crossLinesAndTipMgr(canvas, options) {
    if (typeof Tip != 'function') {
        window.Tip = function () { };
        window.Tip.prototype = { show: function () { }, hide: function () { }, update: function () { } };
    }
    this.canvas = canvas;
    this.options = options;
}

crossLinesAndTipMgr.prototype._removeTipAndCrossLines = function () {
    //var canvas = this.canvas;
    var me = this;
    if (me.tip) me.tip.hide();
    if (me.clsMgr) me.clsMgr.removeCrossLines();
};
crossLinesAndTipMgr.prototype.updateOptions = function (options) {
    this.options = options;
};
crossLinesAndTipMgr.prototype._onMouseOrTouchMove = function (ev) {
    ev = ev || event;
    ev = getOffset(ev);
    var me = this;
    var options = me.options;
    var canvas = me.canvas;
    var canvasPosition = getPageCoord(canvas);
    var range = options.triggerEventRanges;

    //ÅÐ¶ÏÊÇ·ñÔÚ·¶Î§Ö®ÄÚ£¬Èç¹û²»ÔÚ·¶Î§Ö®ÄÚÔòÒÆÈ¥Ê®×ÖÏßºÍtip
    if (ev.offsetX < range.x || ev.offsetX > range.x + range.width
            || ev.offsetY < range.y || ev.offsetY > range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var crossPoint = options.getCrossPoint(ev);
    //Ìí¼ÓÊó±êºÍ´¥ÃþEvent
    var crossLinesOptions = {
        crossPoint: crossPoint,
        verticalRange: { y1: range.y, y2: range.y + range.height },
        horizontalRange: { x1: range.x, x2: range.x + range.width },
        color: options.crossLineOptions.color,
        canvas: canvas
    };
    if (!me.clsMgr) {
        var clsMgr = new crossLines(crossLinesOptions);
        clsMgr.setMouseEvents(function (evHLine) {
            evHLine = evHLine || event;
            evHLine = getOffset(evHLine);
            var translatedEv = { offsetX: evHLine.offsetX + range.x, offsetY: parseInt(me.clsMgr.getHLine().style.top) - canvasPosition.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        }, function (evl) {
            evl = evl || event;
            evl = getOffset(evl);
            var translatedEv = { offsetX: parseInt(me.clsMgr.getVLine().style.left) - canvasPosition.x, offsetY: evl.offsetY + range.y };
            var point = options.getCrossPoint(translatedEv);
            clsMgr.updateCrossPoint(point);
            if (me.tip) {
                me.tip.update(point, options.tipOptions.getTipHtml(translatedEv));
            }
        });

        me.clsMgr = clsMgr;
    } else {
        me.clsMgr.updateOptions(crossLinesOptions);
    }
    me.clsMgr.drawCrossLines();
    if (options.tipOptions) {
        var tipOp = options.tipOptions;
        if (!me.tip) {
            //tipÉèÖÃ
            var tip = new Tip({
                position: { x: tipOp.position.x || false, y: tipOp.position.y || false }, //positionÖÐµÄÖµÊÇÏà¶ÔÓÚcanvasµÄ×óÉÏ½ÇµÄ
                size: tipOp.size,
                opacity: tipOp.opacity || 80,
                cssClass: tipOp.cssClass,
                offsetToPoint: tipOp.offsetToPoint || 30,
                relativePoint: { x: crossPoint.x, y: crossPoint.y },
                canvas: canvas,
                canvasRange: options.triggerEventRanges,
                innerHTML: tipOp.getTipHtml(ev)
            });
            me.tip = tip;
        }

        me.tip.show(crossPoint, tipOp.getTipHtml(ev));
    }
};

crossLinesAndTipMgr.prototype._touchstart = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);
    var src = e.srcElement || e.target || e.relatedTarget;
    this.touchstartTime = new Date();
};
crossLinesAndTipMgr.prototype._touchmove = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);

    var canvas = this.canvas;

    var relativePoint = getPageCoord(canvas);
    var src = e.srcElement || e.target || e.relatedTarget;
    var fixedEvt = setTouchEventOffsetPosition(e, relativePoint);

    this._onMouseOrTouchMove(fixedEvt);
};

crossLinesAndTipMgr.prototype._touchend = function (e) {
    e = e || event;
    disableBubbleAndPreventDefault(e);
    var src = e.srcElement || e.target || e.relatedTarget;
    var canvas = this.canvas;
    var fixedEvt = setTouchEventOffsetPosition(e, getPageCoord(canvas));
    this._removeTipAndCrossLines();

    var time = new Date();
    var ts = time.getTime() - this.touchstartTime.getTime();
    if (ts < 200) {
        if (typeof this.options.onClick == 'function') this.options.onClick();
    }
};
crossLinesAndTipMgr.prototype._mouseout = function (ev) {
    var e = ev || event;
    ev = getOffset(e);
    var me = this;
    var range = me.options.triggerEventRanges;
    //ÅÐ¶ÏÊÇ·ñÔÚ·¶Î§Ö®ÄÚ£¬Èç¹û²»ÔÚ·¶Î§Ö®ÄÚÔòÒÆÈ¥Ê®×ÖÏßºÍtip
    if (ev.offsetX <= range.x || ev.offsetX >= range.x + range.width
            || ev.offsetY <= range.y || ev.offsetY >= range.y + range.height) {
        me._removeTipAndCrossLines();
        return;
    }

    var toEle = e.toElement || e.relatedTarget || e.target;
    
    if (toEle) {
        if (toEle == me.canvas) return;
        if (toEle == me.clsMgr.getHLine() || toEle == me.clsMgr.getVLine()) return;
        me._removeTipAndCrossLines();
    }
};

crossLinesAndTipMgr.prototype.addCrossLinesAndTipEvents = function () {
    var canvas = this.canvas;
    var options = this.options;
    var canvasPosition = getPageCoord(canvas);
    if (canvas.addCrossLinesAndTipEvents == true) return;
    canvas.addCrossLinesAndTipEvents = true;

    var touchable = isTouchDevice();
    var me = this;
    if (touchable) {
        addEvent(canvas, 'touchstart', function (ev) { me._touchstart.call(me, ev); });

        addEvent(canvas, 'touchmove', function (ev) { me._touchmove.call(me, ev); });

        addEvent(canvas, 'touchend', function (ev) { me._touchend.call(me, ev); });
    }
    else {
        addEvent(canvas, 'mouseout', function (ev) { me._mouseout.call(me, ev); });

        addEvent(canvas, 'mousemove', function (ev) { me._onMouseOrTouchMove.call(me, ev); });

        if (typeof options.onClick == 'function') {
            addEvent(canvas, 'click', options.onClick);
        }
    }
};

function addCrossLinesAndTipEvents(canvas, options) { 
    if(!canvas.crossLineAndTipMgrInstance){
        canvas.crossLineAndTipMgrInstance = new crossLinesAndTipMgr(canvas, options);
        canvas.crossLineAndTipMgrInstance.addCrossLinesAndTipEvents();
    }
}
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*
{ font: '11px Arial', region: { x: 0, y: 47, height: 320, width: 55}, color: 'black',align:'right' ,fontHeight:8,textBaseline:'top'}
*/
function yAxis(scalerOptions) {
  this.scalerOptions = scalerOptions;
}

yAxis.prototype = {
    initialize: function (painter) {
        painter.scalerOptions = this.scalerOptions;
    },
    start: function () {
        var ctx = this.ctx;
        ctx.save();
        if (typeof this.scalerOptions.color == 'string') ctx.fillStyle = this.scalerOptions.color;
        ctx.font = this.scalerOptions.font;
        ctx.translate(this.scalerOptions.region.x, this.scalerOptions.region.y);
        if (this.scalerOptions.textBaseline) ctx.textBaseline = this.scalerOptions.textBaseline;
    },
    end: function () { this.ctx.restore(); },
    getX: function (i) {
        if (this.scalerOptions.align == 'left') return 0;

        var w = this.ctx.measureText(this.data[i]).width;
        return this.scalerOptions.region.width - w;
    },
    getY: function (i) {
        if (i == 0) return 0;
        if (i == this.data.length-1) return this.scalerOptions.region.height - this.scalerOptions.fontHeight;
        return (this.scalerOptions.region.height * i / (this.data.length - 1) - this.scalerOptions.fontHeight / 2);
    },
    paintItem: function (i, x, y) {
        if (typeof this.scalerOptions.color == 'function')
            this.ctx.fillStyle = this.scalerOptions.color(this.data[i]);
        this.ctx.fillText(this.data[i], x, y);
    }
};

function calcAxisValues(high, low, count,formatFunc) {
    var diff = high - low;
    var space = diff / (count-1);
    var result = [];
    if (typeof formatFunc == 'undefined') formatFunc = toMoney;
    for (var i = 0; i < count; i++) {
        result.push(toMoney(high - i * space));
    }
    return result;
}


/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*
options:{font:'11px ËÎÌå',color:black,region:{x:5,y:130,width:180,height:20}}
*/
function xAxis(options){
  this.options = options;
}
xAxis.prototype = {
    initialize: function (painter) { painter.options = this.options; },
    start: function () {
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.options.color;
        ctx.font = this.options.font;
        if (this.options.textBaseline) ctx.textBaseline = this.options.textBaseline;
        ctx.translate(this.options.region.x, this.options.region.y);
    },
    getY: function () { return 0; },
    getX: function (i) {
        if (i == 0) return 0;
        var w = this.ctx.measureText(this.data[i]).width;
        if (i == this.data.length - 1) return this.options.region.width - w;
        return (this.options.region.width * i / (this.data.length - 1)) - w / 2;
    },
    paintItem: function (i, x, y) {
        this.ctx.fillText(this.data[i], x, y);
    },
    end: function () {
        this.ctx.restore();
    }
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
var Ajax = {};
Ajax.request = function (method, url, callback, canvasId, showLoading) {
    showLoading = showLoading == undefined ? true : showLoading;
    //ÔØÈëÊý¾Ýµ÷ÓÃPainter»­Í¼
    var client = (window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : (window.XMLHttpRequest ? new XMLHttpRequest() : false));
    var canvas = document.getElementById(canvasId);
    if (canvas && showLoading) {
        canvas.loadingObj = new loading(canvas);
//setDebugMsg('canvas.loadingObj.show begin');
        canvas.loadingObj.show();
//setDebugMsg('canvas.loadingObj.show end');
    }
    client.onreadystatechange = function () {
//setDebugMsg('client.readyState = ' + client.readyState + ',client.status = ' + client.status);
        if (client.readyState == 4 && client.status == 200) {
            if (canvas && showLoading) canvas.loadingObj.hide();
            callback(client);
        }
//setDebugMsg('finish callback');
    };
//setDebugMsg('client.open begin');
    client.open(method || "POST", url, true);
//setDebugMsg('client.open end');
    if (client.overrideMimeType)client.overrideMimeType("text/xml");
//setDebugMsg('client.overrideMimeType');
    client.send();
//setDebugMsg('client.send()');
};

Ajax.get = function (url, callback, canvasId, showLoading) {
    Ajax.request('GET', url,callback, canvasId, showLoading);
};

Ajax.post = function (url, callback, canvasId, showLoading) {
    Ajax.request('POST', url,callback, canvasId, showLoading);
};
/*
html5ÐÐÇéÍ¼¿â
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
ÉÌÒµ»ò¹«¿ª·¢²¼ÇëÁªÏµ£ºyukaizhao@gmail.com
*/
/*
canvasId:canvasId
paintImplement: ¸ºÔð¸æËßpainter¸ÃÈçºÎ»­Í¼
{
getX:function(i){},
getY:function(i){},
start:function(){},
paintItem:function(x,y,i){},
end:function(){},
}
data: »­Í¼Òª±íÏÖµÄÊý¾Ý
*/
var dashSize = 2;

function Painter(canvasId, paintImplement, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas.getContext) return;
    this.ctx = this.canvas.getContext('2d');
    this.data = data;
    this.paintImplement = paintImplement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
}
Painter.prototype = {
    paint: function () {
        var pctx = this.paintImplement;
        var data = this.data;
        var ctx = this.ctx;
        if (typeof pctx.initialize == 'function') pctx.initialize(this);
        if (pctx.start) pctx.start.call(this);

        if (typeof pctx.paintItems == 'function') {
            pctx.paintItems.call(this);
        }
        else {
            var dataLength = ((typeof pctx.getDataLength == 'function') ? pctx.getDataLength.call(this) : this.data.length);
            for (var i = 0; i < dataLength; i++) {
                var x = pctx.getX ? pctx.getX.call(this, i) : undefined;
                var y = pctx.getY ? pctx.getY.call(this, i) : undefined;
                pctx.paintItem.call(this, i, x, y);
            }
        }
        if (pctx.end) pctx.end.call(this);
    },
    drawHLine: function (color, x0, y0, w, lineWidth, lineStyle) {
        var ctx = this.ctx;
        ctx.strokeStyle = color;
        if (y0 * 10 % 10 == 0) y0 += .5;
        if (lineStyle && lineStyle == 'dashed') {
            var width = 0;
            do {
                this.drawHLine(color, width, y0, dashSize, 1, 'solid');
                width += dashSize * 2;
            } while (width < w);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + w, y0);
            ctx.stroke();
        }
    },
    drawVLine: function (color, x0, y0, h, lineWidth, lineStyle) {
        var ctx = this.ctx;
        ctx.strokeStyle = color;
        if (x0 * 10 % 10 == 0) x0 += .5;
        if (lineStyle && lineStyle == 'dashed') {
            var height = 0;
            do {
                this.drawVLine(color, x0, height, dashSize, 1);
                height += dashSize * 2;
            } while (height < h);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y0 + h);
            ctx.stroke();

        }
    },
    setData: function (data) {
        this.data = data;
    },
    setPainterImplement: function (implement) {
        this.paintImplement = implement;
    }
};

function line(ctx, x0, y0, x1, y1, color, width) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    ctx.stroke();
}

function getMinTime(minIndex) {
    //ä¸Šåˆ09ï¼š30-11ï¼š30
    //ä¸‹åˆ13ï¼š00-15ï¼š00
    var d = new Date();
    if (minIndex <= 120) {
        d.setHours(9, 30, 30);
        d = new Date(d.getTime() + (minIndex) * 60 * 1000);
    } else {
        d.setHours(13, 0, 0);
        d = new Date(d.getTime() + (minIndex - 120) * 60 * 1000);
    }


    var hour = d.getHours() > 9 ? new String(d.getHours()) : '0' + d.getHours();
    var minutes = d.getMinutes() > 9 ? new String(d.getMinutes()) : '0' + d.getMinutes();
    var seconds = '30';
    return hour + '' + minutes + seconds;
}

function Tip(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.canvas.tip = this;
}

Tip.prototype = {
    show: function (relativePoint, html) {
        var dc = this.dataContext;
        var painter = this.canvas.painter;
        if (dc) {
            if (dc.isNewQuote) painter.fillTopText(dc.data);
            else painter.fillTopText(dc.data, dc.index);
        }
    },
    update: function (relativePoint, html) {
        this.show(relativePoint, html);
    },
    hide: function () {
        var dc = this.dataContext;
        var painter = this.canvas.painter;
        if (dc) {
            painter.fillTopText(dc.data);
        }
    }
};

function minsChart(canvasId, options) {
    extendObject(options, this);
    this.canvas = $id(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.painter = this;
}

minsChart.prototype = {
    /*
    data format like :{
    quote: {
    time: 20111214150106,
    open: 2241.390,
    preClose: 2248.590,
    highest: 2256.740,
    lowest: 2224.730,
    price: 2228.530,
    volume: 4407982200,
    amount: 38621178573
    },
    mins: [
    {price:2239.45,volume:49499299,amount:459279327}
    ]
    }
    */
    paint: function (data) {
        this.fillTopText(data);
        this.paintChart(data);
        this.paintxAxis();
        this.fillBottomText(data);
        this.paintVolume(data);
    },

    paintVolume: function (data) {
        var ctx = this.ctx;
        var options = this.volume;
        ctx.beginPath();
        ctx.rect(options.region.x, options.region.y, options.region.width, options.region.height);
        ctx.strokeStyle = options.borderColor;
        ctx.stroke();
        line(ctx, options.region.x, options.region.y + options.region.height / 2, options.region.x + options.region.width, options.region.y + options.region.height / 2, options.splitLineColor);
        options.getDataLength = function () { return this.data.items.length; };
        options.maxDotsCount = this.maxDotsCount;
        var volumePainterImp = new volumePainter(options);
        var painter = new Painter(this.canvas.id, volumePainterImp, { items: data.mins });
        painter.paint();

        var max = painter.maxVolume;
        var unit;
        if (max / 1000000 > 1000) {
            max = max / 1000000;
            unit = 'ç™¾ä¸‡';
        } else {
            max = max / 10000;
            unit = 'ä¸‡';
        }
        var scalers = [max.toFixed(2), (max / 2).toFixed(2), '(' + unit + ')'];
        var yscaler = new yAxis(this.volume.yScaler);
        var painter = new Painter(this.canvas.id, yscaler, scalers);
        painter.paint();
    },

    fillBottomText: function (data) {
        if (!this.bottomText) return;
        //é«˜9999 ä½Ž9999 æˆäº¤888999
        var ctx = this.ctx;
        var txt = 'é«˜';
        var options = this.bottomText;
        ctx.font = options.font;
        ctx.fillStyle = options.color;
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, options.region.x, options.region.y);
        var x = options.region.x + w;
        var quote = data.quote;
        var me = this;
        function getTxtColor(val) { return val > quote.preClose ? me.riseColor : (val == quote.preClose ? me.normalColor : me.fallColor); }
        var highColor = getTxtColor(quote.highest);
        var high = toMoney(quote.highest);
        ctx.fillStyle = highColor;
        w = ctx.measureText(high).width;
        ctx.fillText(high, x, options.region.y);
        x += w;
        txt = ' ä½Ž';
        ctx.fillStyle = options.color;
        w = ctx.measureText(txt).width;
        ctx.fillText(txt, x, options.region.y);
        x += w;
        var lowColor = getTxtColor(quote.lowest);
        var low = toMoney(quote.lowest);
        w = ctx.measureText(low).width;
        ctx.fillStyle = lowColor;
        ctx.fillText(low, x, options.region.y);
        x += w;
        ctx.fillStyle = options.color;
        var amount = ' æˆäº¤' + bigNumberToText(quote.amount);
        ctx.fillText(amount, x, options.region.y);
    },

    paintxAxis: function () {
        var xAxisImpl = new xAxis(this.xScaler);
        var xAxisPainter = new Painter(this.canvas.id, xAxisImpl, this.xScaler.data);
        xAxisPainter.paint();
    },

    paintChart: function (data) {
        var minsChartOptions = this.minsChart;
        var region = this.minsChart.region;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = minsChartOptions.borderColor;
        ctx.rect(region.x, region.y, region.width, region.height);
        ctx.stroke();

        //æ°´å¹³çº¿
        var middleIndex = (this.minsChart.horizontalLineCount + this.minsChart.horizontalLineCount % 2) / 2;
        var splitCount = this.minsChart.horizontalLineCount + 1;
        for (var i = 1; i <= this.minsChart.horizontalLineCount; i++) {
            var color = (i == middleIndex ? minsChartOptions.middleLineColor : minsChartOptions.otherSplitLineColor);
            var y = region.y + region.height * i / splitCount;
            line(ctx, region.x, y, region.x + region.width, y, color);
        }
        //åž‚ç›´çº¿ 
        splitCount = this.minsChart.verticalLineCount + 1;
        for (var i = 1; i <= this.minsChart.verticalLineCount; i++) {
            var x = region.x + region.width * i / splitCount;
            line(ctx, x, region.y, x, region.y + region.height, minsChartOptions.otherSplitLineColor);
        }

        //ä»·æ ¼çº¿
        var lineOptions = {
            region: region,
            maxDotsCount: this.maxDotsCount,
            getDataLength: function () { return this.data.items.length; },
            getItemValue: function (item) { return item.price; },
            middleValue: data.quote.preClose, //é€šå¸¸æ˜¯æ˜¨æ”¶
            lineColor: minsChartOptions.priceLineColor
        };
        var linePainterImp = new linePainter(lineOptions);
        var priceLinePainter = new Painter(this.canvas.id, linePainterImp, { items: data.mins });
        priceLinePainter.paint();

        //yè½´
        var yOptions = this.minsChart.yScalerLeft;
        var preClose = data.quote.preClose;
        var me = this;
        yOptions.color = function (val) {
            return val > preClose ? me.riseColor : (val == preClose ? me.normalColor : me.fallColor);
        };
        var scalersLeft = [];
        var scalersRight = [];
        var min = preClose - priceLinePainter.maxDiff;
        var space = priceLinePainter.maxDiff * 2 / (this.minsChart.horizontalLineCount + 1);
        for (var i = this.minsChart.horizontalLineCount + 1; i >= 0; i--) {
            var val = min + i * space;
            scalersLeft.push(val.toFixed(2));
            var percent = (val - preClose) * 100 / preClose;
            scalersRight.push(percent.toFixed(2) + '%');
        }
        var yx = new yAxis(yOptions);
        var yAxisPainter = new Painter(this.canvas.id, yx, scalersLeft);
        yAxisPainter.paint();

        var yPercentOptions = this.minsChart.yScalerRight;
        yPercentOptions.color = function (val) {
            return (val == '0.00%' ? 'black' : (val.charAt(0) == '-' ? 'green' : 'red'));
        };
        var yxPercent = new yAxis(yPercentOptions);
        var yxPercentPainter = new Painter(this.canvas.id, yxPercent, scalersRight);
        yxPercentPainter.paint();


        //å‡çº¿
        if (this.needPaintAvgPriceLine) {
            //ç”Ÿæˆç§»åŠ¨å‡çº¿æ•°æ®
            var items = [];
            var totalVolume = 0;
            var totalAmount = 0;
            data.mins.each(function (item) {
                totalVolume += item.volume;
                totalAmount += item.amount;
                items.push(totalAmount / totalVolume);
            });
            lineOptions.lineColor = minsChartOptions.avgPriceLineColor;
            lineOptions.getItemValue = function (item) { return item; };
            linePainterImp = new linePainter(lineOptions);
            var painterAvg = new Painter(this.canvas.id, linePainterImp, { items: items });
            painterAvg.paint();
        }

        var me = this;
        var chartRegion = me.minsChart.region;

        function getY(x) {
            var index = Math.ceil((x - me.minsChart.region.x) * me.maxDotsCount / me.minsChart.region.width);
            var val;
            var isNewQuote;
            if (index >= 0 && index < data.mins.length) {
                val = data.mins[index].price;
                isNewQuote = false;
            } else {
                val = data.quote.price;
                isNewQuote = true;
            }

            if (me.canvas.tip) me.canvas.tip.dataContext = { data: data, isNewQuote: isNewQuote, index: index };
            var diff = val - preClose;
            var middleY = (me.minsChart.region.y + me.minsChart.region.height / 2);
            return middleY - diff * me.minsChart.region.height / 2 / priceLinePainter.maxDiff;
        }

        //æ·»åŠ é¼ æ ‡äº‹ä»¶
        addCrossLinesAndTipEvents(this.canvas, {
            getCrossPoint: function (ev) { return { x: ev.offsetX, y: getY(ev.offsetX) }; },
            triggerEventRanges: { x: chartRegion.x, y: chartRegion.y, width: chartRegion.width, height: me.volume.region.y + me.volume.region.height - chartRegion.y },
            tipOptions: {
                getTipHtml: function (ev) { return null; },
                position: { x: false, y: false }
            },
            crossLineOptions: {
                color: 'black'
            }
        });
    },

    fillTopText: function (data, minIndex) {
        var quote = data.quote;
        var ctx = this.ctx;
        var topText = this.topText;
        var region = topText.region;
        ctx.clearRect(region.x, region.y, region.width, region.height);
        var price;
        var time;
        if (typeof minIndex == 'undefined') {
            price = quote.price;
            time = quote.time;
        } else {
            price = data.mins[minIndex].price;
            time = quote.time.toString().substr(0, 8) + getMinTime(minIndex);
        }

        ctx.fillStyle = topText.color;
        ctx.font = topText.font;
        if (topText.textBaseline) ctx.textBaseline = topText.textBaseline;
        var txt = '最新' + toMoney(price) + "  ";
        var width = ctx.measureText(txt).width;
        ctx.fillText(txt, topText.region.x, topText.region.y);

        var isRise = price > quote.preClose;
        var isEqual = price == quote.preClose;
        var isFall = price < quote.preClose;
        var diff = toMoney(price - quote.preClose);
        var txtRiseFall = (isRise ? '^' : (isFall ? 'v' : '')) + diff
    + ('(')
    + toMoney(diff * 100 / quote.preClose)
    + '%)';

        var x = topText.region.x + width;
        ctx.fillStyle = isRise ? this.riseColor : (isFall ? this.fallColor : this.normalColor);
        ctx.fillText(txtRiseFall, x, topText.region.y);

        var temp = new String(time);
        var txtTime = temp.charAt(8) + temp.charAt(9) + ':' + temp.charAt(10) + temp.charAt(11);
        ctx.fillStyle = topText.color;
        var timeWidth = ctx.measureText(txtTime).width;
        ctx.fillText(txtTime, topText.region.x + topText.region.width - timeWidth, topText.region.y);
    }
};