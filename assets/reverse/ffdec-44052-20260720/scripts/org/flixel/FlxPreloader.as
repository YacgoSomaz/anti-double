package org.flixel
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.display.StageAlign;
   import flash.display.StageScaleMode;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.media.SoundMixer;
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.getDefinitionByName;
   
   public class FlxPreloader extends MovieClip
   {
      
      protected var ImgLogo:Class;
      
      protected var ImgLogoCorners:Class;
      
      protected var ImgLogoLight:Class;
      
      private var ImgBarBack:Class;
      
      private var FlashAds:Class;
      
      public var menuobj:MovieClip;
      
      private var Buffer:Sprite;
      
      private var bmpBar:Bitmap;
      
      private var bits:Array;
      
      private var bmpBarBack:Bitmap;
      
      protected var _init:Boolean;
      
      protected var _buffer:Sprite;
      
      protected var _bmpBar:Bitmap;
      
      protected var _text:TextField;
      
      protected var _width:uint;
      
      protected var _height:uint;
      
      protected var _logo:Bitmap;
      
      protected var _logoGlow:Bitmap;
      
      protected var _min:uint;
      
      public var className:String;
      
      public var myURL:String;
      
      public var minDisplayTime:Number;
      
      public function FlxPreloader()
      {
         var tmp:Bitmap = null;
         var re:RegExp = null;
         var fmt:TextFormat = null;
         var txt:TextField = null;
         this.ImgLogo = FlxPreloader_ImgLogo;
         this.ImgLogoCorners = FlxPreloader_ImgLogoCorners;
         this.ImgLogoLight = FlxPreloader_ImgLogoLight;
         this.ImgBarBack = FlxPreloader_ImgBarBack;
         this.FlashAds = FlxPreloader_FlashAds;
         super();
         this.minDisplayTime = 0;
         stop();
         this.menuobj = new this.FlashAds() as MovieClip;
         stage.scaleMode = StageScaleMode.NO_SCALE;
         stage.align = StageAlign.TOP_LEFT;
         try
         {
            throw new Error("Setting global debug flag...");
         }
         catch(e:Error)
         {
            re = /\[.*:[0-9]+\]/;
            FlxG.debug = re.test(e.getStackTrace());
         }
         if(!FlxG.debug && this.myURL != null && root.loaderInfo.url.indexOf(this.myURL) < 0)
         {
            tmp = new Bitmap(new BitmapData(stage.stageWidth,stage.stageHeight,true,4294967295));
            addChild(tmp);
            fmt = new TextFormat();
            fmt.color = 0;
            fmt.size = 16;
            fmt.align = "center";
            fmt.bold = true;
            fmt.font = "system";
            txt = new TextField();
            txt.width = tmp.width - 16;
            txt.height = tmp.height - 16;
            txt.y = 8;
            txt.multiline = true;
            txt.wordWrap = true;
            txt.embedFonts = true;
            txt.defaultTextFormat = fmt;
            txt.text = "Hi there!  It looks like somebody copied this game without my permission.  Just click anywhere, or copy-paste this URL into your browser.\n\n" + this.myURL + "\n\nto play the game at my site.  Thanks, and have fun!";
            addChild(txt);
            txt.addEventListener(MouseEvent.CLICK,this.goToMyURL);
            tmp.addEventListener(MouseEvent.CLICK,this.goToMyURL);
            return;
         }
         this._init = false;
         this.Buffer = new MovieClip();
         this.Buffer.scaleX = 1;
         this.Buffer.scaleY = 1;
         addChild(this.Buffer);
         this.bmpBarBack = new this.ImgBarBack();
         this.bmpBarBack.visible = false;
         this.bmpBarBack.x = 190 - 35;
         this.bmpBarBack.y = 362;
         this.Buffer.addChild(this.bmpBarBack);
         addChild(this.menuobj);
         this.bmpBar = new Bitmap(new BitmapData(322,10,true,4291940817));
         this.bmpBar.x = 192 - 35;
         this.bmpBar.y = 364;
         this.bmpBar.visible = false;
         this.Buffer.addChild(this.bmpBar);
         addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
      }
      
      private function goToMyURL(param1:MouseEvent = null) : void
      {
         navigateToURL(new URLRequest("http://" + this.myURL));
      }
      
      private function onEnterFrame(param1:Event) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Class = null;
         var _loc4_:Object = null;
         var _loc5_:Number = NaN;
         graphics.clear();
         FlxG.percentageLoaded = root.loaderInfo.bytesLoaded / root.loaderInfo.bytesTotal * 100;
         if(FlxG.waitingForLoad)
         {
            this.bmpBarBack.visible = true;
            this.bmpBar.visible = true;
         }
         if(FlxG.prePlay)
         {
            SoundMixer.stopAll();
            removeChild(this.menuobj);
            SoundMixer.stopAll();
            removeEventListener(Event.ENTER_FRAME,this.onEnterFrame);
            nextFrame();
            _loc3_ = Class(getDefinitionByName(this.className));
            if(_loc3_)
            {
               _loc4_ = new _loc3_();
               addChild(_loc4_ as DisplayObject);
            }
            removeChild(this.Buffer);
            FlxG.prePlay = false;
         }
         else
         {
            _loc5_ = root.loaderInfo.bytesLoaded / root.loaderInfo.bytesTotal;
            this.bmpBar.width = 322 * _loc5_;
         }
      }
      
      protected function create() : void
      {
      }
      
      protected function update(param1:Number) : void
      {
      }
   }
}

