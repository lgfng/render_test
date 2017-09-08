
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        // this.sprite = new cc.Sprite(res.HelloWorld_png);
        // this.sprite.attr({
        //     x: size.width / 2,
        //     y: size.height / 2
        // });
        // this.addChild(this.sprite, 0);

        var winSize = cc.winSize;
      var node = new cc.Node();

        //Whether to demonstrate the effects inside a smaller rect
        var nodeGrid = new cc.NodeGrid();
        nodeGrid.addChild(node);
        nodeGrid.runAction(this.getEffect(3));
        this.addChild( nodeGrid );

        var sister1 = new cc.Sprite(res.poke_bg_png);
        var sister2 = new cc.Sprite(res.poke_front_png);
        sister1.x = winSize.width / 2;
        sister1.y = winSize.height / 2;
        sister1.x = winSize.width / 2;
        sister1.y = winSize.height / 2;

        var node2 = new cc.Node()
        var nodeGrid2 = new cc.NodeGrid();
        nodeGrid2.addChild(node2)
        nodeGrid2.runAction(this.getEffect(3));
        this.addChild(nodeGrid2);
        node.addChild(sister1);
        node2.addChild(sister2);
        return true;
    },

    getEffect: function(duration){
        // var action = cc.pageTurn3D(duration, cc.size(5,5));
        var action = new TurnMySelf(duration, cc.size(5,5));
        action = cc.repeatForever(action);
        return action;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

var TurnMySelf = cc.PageTurn3D.extend({
    bg:null,
    front:null,

    offsetX : 0,
    update : function(time){
        this.offsetX += time * 100;
        if(this.offsetX >= this._gridSize.width){
            this.offsetX = 0;
        }
        this.calculateHorizontalVertexPoints(this.offsetX);
    },

    calculateHorizontalVertexPoints: function(offsetX){
        var theta = Math.PI / 6;
        var R = 50;
        // var b = bg.getContentSize().width - offsetX * Math.sin(theta);
        var b = this._gridSize.width - offsetX * Math.sin(theta);

        var locGridSize = this._gridSize;
        var locVer = cc.p(0, 0);
        for (var i = 0; i <= locGridSize.width; ++i) {
            for (var j = 0; j <= locGridSize.height; ++j) {

                locVer.x = i;
                locVer.y = j;
                // Get original vertex
                var p = this.getOriginalVertex(locVer);
                var x = (p.x + b ) / Math.tan(theta);
                        
                var pivotX = x + (p.x - x) * Math.cos(theta) * Math.cos(theta);
                var pivotY = pivotX * Math.tan(theta)- b;
            
                var l = (p.x - pivotX) / Math.sin(theta);
                var alpha = l / R;
                if (l >= 0) {
                    if (alpha > M_PI) {
                        p.x = (20 + pivotX - R * (alpha -M_PI) * Math.sin(theta));
                        p.y = (20 + pivotY + R * (alpha -M_PI) * Math.cos(theta));
                        p.z = (2 * R /9);
                    }
                    else if (alpha <= M_PI)
                    {
                        p.x = (20 + pivotX + R *Math.sin(alpha) *Math.sin(theta));
                        p.y = (20 + pivotY - R *Math.sin(alpha) *Math.cos(theta));
                        p.z = ((R - R *Math.cos(alpha))/9);
                    }
                }
                else
                {
                    p.x +=20;
                    p.y +=20;
                }
                this.setVertex(locVer, p);
            }
        }
    }
});

