package org.flixel.data
{
   import flash.ui.Mouse;
   import org.flixel.FlxButton;
   import org.flixel.FlxG;
   import org.flixel.FlxObject;
   import org.flixel.FlxSprite;
   import org.flixel.FlxText;
   import org.flixel.FlxU;
   
   public class FlxPanel extends FlxObject
   {
      
      private var ImgDonate:Class = FlxPanel_ImgDonate;
      
      private var ImgStumble:Class = FlxPanel_ImgStumble;
      
      private var ImgDigg:Class = FlxPanel_ImgDigg;
      
      private var ImgReddit:Class = FlxPanel_ImgReddit;
      
      private var ImgDelicious:Class = FlxPanel_ImgDelicious;
      
      private var ImgTwitter:Class = FlxPanel_ImgTwitter;
      
      private var ImgClose:Class = FlxPanel_ImgClose;
      
      protected var _topBar:FlxSprite;
      
      protected var _mainBar:FlxSprite;
      
      protected var _bottomBar:FlxSprite;
      
      protected var _donate:FlxButton;
      
      protected var _stumble:FlxButton;
      
      protected var _digg:FlxButton;
      
      protected var _reddit:FlxButton;
      
      protected var _delicious:FlxButton;
      
      protected var _twitter:FlxButton;
      
      protected var _close:FlxButton;
      
      protected var _caption:FlxText;
      
      protected var _payPalID:String;
      
      protected var _payPalAmount:Number;
      
      protected var _gameTitle:String;
      
      protected var _gameURL:String;
      
      protected var _initialized:Boolean;
      
      protected var _closed:Boolean;
      
      protected var _ty:Number;
      
      protected var _s:Number;
      
      public function FlxPanel()
      {
         super();
         y = -21;
         this._ty = y;
         this._closed = false;
         this._initialized = false;
         this._topBar = new FlxSprite();
         this._topBar.createGraphic(FlxG.width,1,2147483647);
         this._topBar.scrollFactor.x = 0;
         this._topBar.scrollFactor.y = 0;
         this._mainBar = new FlxSprite();
         this._mainBar.createGraphic(FlxG.width,19,2130706432);
         this._mainBar.scrollFactor.x = 0;
         this._mainBar.scrollFactor.y = 0;
         this._bottomBar = new FlxSprite();
         this._bottomBar.createGraphic(FlxG.width,1,2147483647);
         this._bottomBar.scrollFactor.x = 0;
         this._bottomBar.scrollFactor.y = 0;
         this._donate = new FlxButton(3,0,this.onDonate);
         this._donate.loadGraphic(new FlxSprite(0,0,this.ImgDonate));
         this._donate.scrollFactor.x = 0;
         this._donate.scrollFactor.y = 0;
         this._stumble = new FlxButton(FlxG.width / 2 - 6 - 13 - 6 - 13 - 6,0,this.onStumble);
         this._stumble.loadGraphic(new FlxSprite(0,0,this.ImgStumble));
         this._stumble.scrollFactor.x = 0;
         this._stumble.scrollFactor.y = 0;
         this._digg = new FlxButton(FlxG.width / 2 - 6 - 13 - 6,0,this.onDigg);
         this._digg.loadGraphic(new FlxSprite(0,0,this.ImgDigg));
         this._digg.scrollFactor.x = 0;
         this._digg.scrollFactor.y = 0;
         this._reddit = new FlxButton(FlxG.width / 2 - 6,0,this.onReddit);
         this._reddit.loadGraphic(new FlxSprite(0,0,this.ImgReddit));
         this._reddit.scrollFactor.x = 0;
         this._reddit.scrollFactor.y = 0;
         this._delicious = new FlxButton(FlxG.width / 2 + 7 + 6,0,this.onDelicious);
         this._delicious.loadGraphic(new FlxSprite(0,0,this.ImgDelicious));
         this._delicious.scrollFactor.x = 0;
         this._delicious.scrollFactor.y = 0;
         this._twitter = new FlxButton(FlxG.width / 2 + 7 + 6 + 12 + 6,0,this.onTwitter);
         this._twitter.loadGraphic(new FlxSprite(0,0,this.ImgTwitter));
         this._twitter.scrollFactor.x = 0;
         this._twitter.scrollFactor.y = 0;
         this._caption = new FlxText(FlxG.width / 2,0,FlxG.width / 2 - 19,"");
         this._caption.alignment = "right";
         this._caption.scrollFactor.x = 0;
         this._caption.scrollFactor.y = 0;
         this._close = new FlxButton(FlxG.width - 16,0,this.onClose);
         this._close.loadGraphic(new FlxSprite(0,0,this.ImgClose));
         this._close.scrollFactor.x = 0;
         this._close.scrollFactor.y = 0;
         this.hide();
         visible = false;
         this._s = 50;
      }
      
      public function setup(param1:String, param2:Number, param3:String, param4:String, param5:String) : void
      {
         this._payPalID = param1;
         if(this._payPalID.length <= 0)
         {
            this._donate.visible = false;
         }
         this._payPalAmount = param2;
         this._gameTitle = param3;
         this._gameURL = param4;
         this._caption.text = param5;
         this._initialized = true;
      }
      
      override public function update() : void
      {
         if(!this._initialized)
         {
            return;
         }
         if(this._ty != y)
         {
            if(y < this._ty)
            {
               y += FlxG.elapsed * this._s;
               if(y > this._ty)
               {
                  y = this._ty;
               }
            }
            else
            {
               y -= FlxG.elapsed * this._s;
               if(y < this._ty)
               {
                  y = this._ty;
               }
            }
            this._topBar.y = y;
            this._mainBar.y = y + 1;
            this._bottomBar.y = y + 20;
            this._donate.reset(this._donate.x,y + 4);
            this._stumble.reset(this._stumble.x,y + 4);
            this._digg.reset(this._digg.x,y + 4);
            this._reddit.reset(this._reddit.x,y + 4);
            this._delicious.reset(this._delicious.x,y + 5);
            this._twitter.reset(this._twitter.x,y + 4);
            this._caption.reset(this._caption.x,y + 4);
            this._close.reset(this._close.x,y + 4);
         }
         if(y <= -21 || y >= FlxG.height)
         {
            visible = false;
         }
         else
         {
            visible = true;
         }
         if(visible)
         {
            if(this._donate.active)
            {
               this._donate.update();
            }
            if(this._stumble.active)
            {
               this._stumble.update();
            }
            if(this._digg.active)
            {
               this._digg.update();
            }
            if(this._reddit.active)
            {
               this._reddit.update();
            }
            if(this._delicious.active)
            {
               this._delicious.update();
            }
            if(this._twitter.active)
            {
               this._twitter.update();
            }
            if(this._caption.active)
            {
               this._caption.update();
            }
            if(this._close.active)
            {
               this._close.update();
            }
         }
      }
      
      override public function render() : void
      {
         if(!this._initialized)
         {
            return;
         }
         if(this._topBar.visible)
         {
            this._topBar.render();
         }
         if(this._mainBar.visible)
         {
            this._mainBar.render();
         }
         if(this._bottomBar.visible)
         {
            this._bottomBar.render();
         }
         if(this._donate.visible)
         {
            this._donate.render();
         }
         if(this._stumble.visible)
         {
            this._stumble.render();
         }
         if(this._digg.visible)
         {
            this._digg.render();
         }
         if(this._reddit.visible)
         {
            this._reddit.render();
         }
         if(this._delicious.visible)
         {
            this._delicious.render();
         }
         if(this._twitter.visible)
         {
            this._twitter.render();
         }
         if(this._caption.visible)
         {
            this._caption.render();
         }
         if(this._close.visible)
         {
            this._close.render();
         }
      }
      
      public function show(param1:Boolean = true) : void
      {
         if(this._closed)
         {
            return;
         }
         if(!this._initialized)
         {
            FlxG.log("SUPPORT PANEL ERROR: Uninitialized.\nYou forgot to call FlxGame.setupSupportPanel()\nfrom your game constructor.");
            return;
         }
         if(param1)
         {
            y = -21;
            this._ty = -1;
         }
         else
         {
            y = FlxG.height;
            this._ty = FlxG.height - 20;
         }
         this._donate.reset(this._donate.x,y + 4);
         this._stumble.reset(this._stumble.x,y + 4);
         this._digg.reset(this._digg.x,y + 4);
         this._reddit.reset(this._reddit.x,y + 4);
         this._delicious.reset(this._delicious.x,y + 5);
         this._twitter.reset(this._twitter.x,y + 4);
         this._caption.reset(this._caption.x,y + 4);
         this._close.reset(this._close.x,y + 4);
         if(!FlxG.mouse.cursor.visible)
         {
            Mouse.show();
         }
         visible = true;
      }
      
      public function hide() : void
      {
         if(y < 0)
         {
            this._ty = -21;
         }
         else
         {
            this._ty = FlxG.height;
         }
      }
      
      public function onDonate() : void
      {
         FlxU.openURL("https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=" + encodeURIComponent(this._payPalID) + "&item_name=" + encodeURIComponent(this._gameTitle + " Contribution (" + this._gameURL) + ")&currency_code=USD&amount=" + this._payPalAmount);
      }
      
      public function onStumble() : void
      {
         FlxU.openURL("http://www.stumbleupon.com/submit?url=" + encodeURIComponent(this._gameURL));
      }
      
      public function onDigg() : void
      {
         FlxU.openURL("http://digg.com/submit?url=" + encodeURIComponent(this._gameURL) + "&title=" + encodeURIComponent(this._gameTitle));
      }
      
      public function onReddit() : void
      {
         FlxU.openURL("http://www.reddit.com/submit?url=" + encodeURIComponent(this._gameURL));
      }
      
      public function onDelicious() : void
      {
         FlxU.openURL("http://delicious.com/save?v=5&amp;noui&amp;jump=close&amp;url=" + encodeURIComponent(this._gameURL) + "&amp;title=" + encodeURIComponent(this._gameTitle));
      }
      
      public function onTwitter() : void
      {
         FlxU.openURL("http://twitter.com/home?status=Playing" + encodeURIComponent(" " + this._gameTitle + " - " + this._gameURL));
      }
      
      public function onClose() : void
      {
         this._closed = true;
         this.hide();
      }
   }
}

