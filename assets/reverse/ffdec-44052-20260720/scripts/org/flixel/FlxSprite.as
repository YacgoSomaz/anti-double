package org.flixel
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.geom.ColorTransform;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import org.flixel.data.FlxAnim;
   
   public class FlxSprite extends FlxObject
   {
      
      public static const LEFT:uint = 0;
      
      public static const RIGHT:uint = 1;
      
      public static const UP:uint = 2;
      
      public static const DOWN:uint = 3;
      
      public var depth:int;
      
      public var bitmapWrapper:Bitmap;
      
      public var offset:FlxPoint;
      
      public var scale:FlxPoint;
      
      public var blend:String;
      
      public var antialiasing:Boolean;
      
      public var finished:Boolean;
      
      public var frameWidth:uint;
      
      public var frameHeight:uint;
      
      protected var _animations:Array;
      
      protected var _flipped:uint;
      
      public var _curAnim:FlxAnim;
      
      public var _curFrame:uint;
      
      protected var _caf:uint;
      
      protected var _frameTimer:Number;
      
      protected var _callback:Function;
      
      protected var _facing:uint;
      
      protected var _bakedRotation:Number;
      
      protected var _flashRect:Rectangle;
      
      protected var _flashRect2:Rectangle;
      
      protected var _flashPointZero:Point;
      
      protected var _pixels:BitmapData;
      
      protected var _framePixels:BitmapData;
      
      protected var _alpha:Number;
      
      protected var _color:uint;
      
      protected var _ct:ColorTransform;
      
      protected var _mtx:Matrix;
      
      protected var _bbb:BitmapData;
      
      public function FlxSprite(param1:Number = 0, param2:Number = 0, param3:Class = null)
      {
         super();
         x = param1;
         y = param2;
         this._flashRect = new Rectangle();
         this._flashRect2 = new Rectangle();
         this._flashPointZero = new Point();
         this.offset = new FlxPoint();
         this.scale = new FlxPoint(1,1);
         this._alpha = 1;
         this._color = 16777215;
         this.blend = null;
         this.antialiasing = false;
         this.finished = false;
         this._facing = RIGHT;
         this._animations = new Array();
         this._flipped = 0;
         this._curAnim = null;
         this._curFrame = 0;
         this._caf = 0;
         this._frameTimer = 0;
         this._mtx = new Matrix();
         this._callback = null;
         if(param3 == null)
         {
            this.createGraphic(8,8);
         }
         else
         {
            this.loadGraphic(param3);
         }
      }
      
      public function loadGraphic(param1:Class, param2:Boolean = false, param3:Boolean = false, param4:uint = 0, param5:uint = 0, param6:Boolean = false) : FlxSprite
      {
         this._bakedRotation = 0;
         this._pixels = FlxG.addBitmap(param1,param3,param6);
         if(param3)
         {
            this._flipped = this._pixels.width >> 1;
         }
         else
         {
            this._flipped = 0;
         }
         if(param4 == 0)
         {
            if(param2)
            {
               param4 = uint(this._pixels.height);
            }
            else if(this._flipped > 0)
            {
               param4 = this._pixels.width / 2;
            }
            else
            {
               param4 = uint(this._pixels.width);
            }
         }
         width = this.frameWidth = param4;
         if(param5 == 0)
         {
            if(param2)
            {
               param5 = width;
            }
            else
            {
               param5 = uint(this._pixels.height);
            }
         }
         height = this.frameHeight = param5;
         this.resetHelpers();
         return this;
      }
      
      public function loadRotatedGraphic(param1:Class, param2:uint = 16, param3:int = -1, param4:Boolean = false, param5:Boolean = false) : FlxSprite
      {
         var _loc12_:BitmapData = null;
         var _loc13_:uint = 0;
         var _loc14_:uint = 0;
         var _loc15_:uint = 0;
         var _loc16_:uint = 0;
         var _loc17_:uint = 0;
         var _loc18_:Number = NaN;
         var _loc19_:uint = 0;
         var _loc20_:uint = 0;
         var _loc21_:uint = 0;
         var _loc22_:uint = 0;
         var _loc6_:uint = Math.sqrt(param2);
         var _loc7_:BitmapData = FlxG.addBitmap(param1);
         if(param3 >= 0)
         {
            _loc12_ = _loc7_;
            _loc7_ = new BitmapData(_loc12_.height,_loc12_.height);
            _loc13_ = param3 * _loc7_.width;
            _loc14_ = 0;
            _loc15_ = uint(_loc12_.width);
            if(_loc13_ >= _loc15_)
            {
               _loc14_ = uint(_loc13_ / _loc15_) * _loc7_.height;
               _loc13_ %= _loc15_;
            }
            this._flashRect.x = _loc13_;
            this._flashRect.y = _loc14_;
            this._flashRect.width = _loc7_.width;
            this._flashRect.height = _loc7_.height;
            _loc7_.copyPixels(_loc12_,this._flashRect,this._flashPointZero);
         }
         var _loc8_:uint = uint(_loc7_.width);
         if(_loc7_.height > _loc8_)
         {
            _loc8_ = uint(_loc7_.height);
         }
         if(param5)
         {
            _loc8_ *= 1.5;
         }
         var _loc9_:uint = FlxU.ceil(param2 / _loc6_);
         width = _loc8_ * _loc9_;
         height = _loc8_ * _loc6_;
         var _loc10_:String = String(param1) + ":" + param3 + ":" + width + "x" + height;
         var _loc11_:Boolean = FlxG.checkBitmapCache(_loc10_);
         this._pixels = FlxG.createBitmap(width,height,0,true,_loc10_);
         width = this.frameWidth = this._pixels.width;
         height = this.frameHeight = this._pixels.height;
         this._bakedRotation = 360 / param2;
         if(!_loc11_)
         {
            _loc18_ = 0;
            _loc19_ = _loc7_.width / 2;
            _loc20_ = _loc7_.height / 2;
            _loc21_ = _loc8_ / 2;
            _loc22_ = _loc8_ / 2;
            _loc16_ = 0;
            while(_loc16_ < _loc6_)
            {
               _loc17_ = 0;
               while(_loc17_ < _loc9_)
               {
                  this._mtx.identity();
                  this._mtx.translate(-_loc19_,-_loc20_);
                  this._mtx.rotate(Math.PI * 2 * (_loc18_ / 360));
                  this._mtx.translate(_loc8_ * _loc17_ + _loc21_,_loc22_);
                  _loc18_ += this._bakedRotation;
                  this._pixels.draw(_loc7_,this._mtx,null,null,null,param4);
                  _loc17_++;
               }
               _loc22_ += _loc8_;
               _loc16_++;
            }
         }
         this.frameWidth = this.frameHeight = width = height = _loc8_;
         this.resetHelpers();
         return this;
      }
      
      public function createGraphic(param1:uint, param2:uint, param3:uint = 4294967295, param4:Boolean = false, param5:String = null) : FlxSprite
      {
         this._bakedRotation = 0;
         this._pixels = FlxG.createBitmap(param1,param2,param3,param4,param5);
         width = this.frameWidth = this._pixels.width;
         height = this.frameHeight = this._pixels.height;
         this.resetHelpers();
         return this;
      }
      
      public function get pixels() : BitmapData
      {
         return this._pixels;
      }
      
      public function set pixels(param1:BitmapData) : void
      {
         this._pixels = param1;
         width = this.frameWidth = this._pixels.width;
         height = this.frameHeight = this._pixels.height;
         this.resetHelpers();
      }
      
      protected function resetHelpers() : void
      {
         this._flashRect.x = 0;
         this._flashRect.y = 0;
         this._flashRect.width = this.frameWidth;
         this._flashRect.height = this.frameHeight;
         this._flashRect2.x = 0;
         this._flashRect2.y = 0;
         this._flashRect2.width = this._pixels.width;
         this._flashRect2.height = this._pixels.height;
         if(this._framePixels == null || this._framePixels.width != width || this._framePixels.height != height)
         {
            this._framePixels = new BitmapData(width,height);
            this.bitmapWrapper = new Bitmap(this._framePixels);
         }
         if(this._bbb == null || this._bbb.width != width || this._bbb.height != height)
         {
            this._bbb = new BitmapData(width,height);
         }
         origin.x = this.frameWidth / 2;
         origin.y = this.frameHeight / 2;
         this._framePixels.copyPixels(this._pixels,this._flashRect,this._flashPointZero);
         if(FlxG.showBounds)
         {
            this.drawBounds();
         }
         this._caf = 0;
         refreshHulls();
      }
      
      override public function set solid(param1:Boolean) : void
      {
         var _loc2_:Boolean = _solid;
         _solid = param1;
         if(_loc2_ != _solid && FlxG.showBounds)
         {
            this.calcFrame();
         }
      }
      
      override public function set fixed(param1:Boolean) : void
      {
         var _loc2_:Boolean = _fixed;
         _fixed = param1;
         if(_loc2_ != _fixed && FlxG.showBounds)
         {
            this.calcFrame();
         }
      }
      
      public function get facing() : uint
      {
         return this._facing;
      }
      
      public function set facing(param1:uint) : void
      {
         var _loc2_:Boolean = this._facing != param1;
         this._facing = param1;
         if(_loc2_)
         {
            this.calcFrame();
         }
      }
      
      public function get alpha() : Number
      {
         return this._alpha;
      }
      
      public function set alpha(param1:Number) : void
      {
         if(param1 > 1)
         {
            param1 = 1;
         }
         if(param1 < 0)
         {
            param1 = 0;
         }
         if(param1 == this._alpha)
         {
            return;
         }
         this._alpha = param1;
         if(this._alpha != 1 || this._color != 16777215)
         {
            this._ct = new ColorTransform(Number(this._color >> 16) / 255,Number(this._color >> 8 & 0xFF) / 255,Number(this._color & 0xFF) / 255,this._alpha);
         }
         else
         {
            this._ct = null;
         }
         this.calcFrame();
      }
      
      public function get color() : uint
      {
         return this._color;
      }
      
      public function set color(param1:uint) : void
      {
         param1 &= 16777215;
         if(this._color == param1)
         {
            return;
         }
         this._color = param1;
         if(this._alpha != 1 || this._color != 16777215)
         {
            this._ct = new ColorTransform(Number(this._color >> 16) / 255,Number(this._color >> 8 & 0xFF) / 255,Number(this._color & 0xFF) / 255,this._alpha);
         }
         else
         {
            this._ct = null;
         }
         this.calcFrame();
      }
      
      public function draw(param1:FlxSprite, param2:int = 0, param3:int = 0) : void
      {
         var _loc4_:BitmapData = param1._framePixels;
         if((param1.angle == 0 || param1._bakedRotation > 0) && param1.scale.x == 1 && param1.scale.y == 1 && param1.blend == null)
         {
            _flashPoint.x = param2;
            _flashPoint.y = param3;
            this._flashRect2.width = _loc4_.width;
            this._flashRect2.height = _loc4_.height;
            this._pixels.copyPixels(_loc4_,this._flashRect2,_flashPoint,null,null,true);
            this._flashRect2.width = this._pixels.width;
            this._flashRect2.height = this._pixels.height;
            this.calcFrame();
            return;
         }
         this._mtx.identity();
         this._mtx.translate(-param1.origin.x,-param1.origin.y);
         this._mtx.scale(param1.scale.x,param1.scale.y);
         if(param1.angle != 0)
         {
            this._mtx.rotate(Math.PI * 2 * (param1.angle / 360));
         }
         this._mtx.translate(param2 + param1.origin.x,param3 + param1.origin.y);
         this._pixels.draw(_loc4_,this._mtx,null,param1.blend,null,param1.antialiasing);
         this.calcFrame();
      }
      
      public function fill(param1:uint) : void
      {
         this._pixels.fillRect(this._flashRect2,param1);
         if(this._pixels != this._framePixels)
         {
            this.calcFrame();
         }
      }
      
      protected function updateAnimation() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:int = 0;
         if(this._bakedRotation)
         {
            _loc1_ = this._caf;
            _loc2_ = angle % 360;
            if(_loc2_ < 0)
            {
               _loc2_ += 360;
            }
            this._caf = _loc2_ / this._bakedRotation;
            if(_loc1_ != this._caf)
            {
               this.calcFrame();
            }
            return;
         }
         if(this._curAnim != null && this._curAnim.delay > 0 && (this._curAnim.looped || !this.finished))
         {
            this._frameTimer += FlxG.elapsed;
            if(this._frameTimer > this._curAnim.delay)
            {
               this._frameTimer -= this._curAnim.delay;
               if(this._curFrame == this._curAnim.frames.length - 1)
               {
                  if(this._curAnim.looped)
                  {
                     this._curFrame = 0;
                  }
                  this.finished = true;
               }
               else
               {
                  ++this._curFrame;
               }
               this._caf = this._curAnim.frames[this._curFrame];
               this.calcFrame();
            }
         }
      }
      
      override public function update() : void
      {
         updateMotion();
         this.updateAnimation();
         updateFlickering();
      }
      
      protected function renderSprite() : void
      {
         if(_refreshBounds)
         {
            this.calcFrame();
         }
         this.getScreenXY(_point);
         _flashPoint.x = _point.x;
         _flashPoint.y = _point.y;
         if((angle == 0 || this._bakedRotation > 0) && this.scale.x == 1 && this.scale.y == 1 && this.blend == null)
         {
            FlxG.buffer.copyPixels(this._framePixels,this._flashRect,_flashPoint,null,null,true);
            return;
         }
         this._mtx.identity();
         this._mtx.translate(-origin.x,-origin.y);
         this._mtx.scale(this.scale.x,this.scale.y);
         if(angle != 0)
         {
            this._mtx.rotate(Math.PI * 2 * (angle / 360));
         }
         this._mtx.translate(_point.x + origin.x,_point.y + origin.y);
         FlxG.buffer.draw(this.bitmapWrapper,this._mtx,null,this.blend,null,this.antialiasing);
      }
      
      override public function render() : void
      {
         this.renderSprite();
      }
      
      override public function overlapsPoint(param1:Number, param2:Number, param3:Boolean = false) : Boolean
      {
         param1 -= FlxU.floor(FlxG.scroll.x);
         param2 -= FlxU.floor(FlxG.scroll.y);
         this.getScreenXY(_point);
         if(param3)
         {
            return this._framePixels.hitTest(new Point(0,0),255,new Point(param1 - _point.x,param2 - _point.y));
         }
         if(param1 <= _point.x || param1 >= _point.x + this.frameWidth || param2 <= _point.y || param2 >= _point.y + this.frameHeight)
         {
            return false;
         }
         return true;
      }
      
      public function onEmit() : void
      {
      }
      
      public function addAnimation(param1:String, param2:Array, param3:Number = 0, param4:Boolean = true) : void
      {
         this._animations.push(new FlxAnim(param1,param2,param3,param4));
      }
      
      public function addAnimationCallback(param1:Function) : void
      {
         this._callback = param1;
      }
      
      public function play(param1:String, param2:Boolean = false) : void
      {
         if(!param2 && this._curAnim != null && param1 == this._curAnim.name)
         {
            return;
         }
         this._curFrame = 0;
         this._caf = 0;
         this._frameTimer = 0;
         var _loc3_:uint = this._animations.length;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            if(this._animations[_loc4_].name == param1)
            {
               this._curAnim = this._animations[_loc4_];
               if(this._curAnim.delay <= 0)
               {
                  this.finished = true;
               }
               else
               {
                  this.finished = false;
               }
               this._caf = this._curAnim.frames[this._curFrame];
               this.calcFrame();
               return;
            }
            _loc4_++;
         }
      }
      
      public function randomFrame() : void
      {
         this._curAnim = null;
         this._caf = int(FlxU.random() * (this._pixels.width / this.frameWidth));
         this.calcFrame();
      }
      
      public function get frame() : uint
      {
         return this._caf;
      }
      
      public function set frame(param1:uint) : void
      {
         this._curAnim = null;
         this._caf = param1;
         this.calcFrame();
      }
      
      override public function getScreenXY(param1:FlxPoint = null) : FlxPoint
      {
         if(param1 == null)
         {
            param1 = new FlxPoint();
         }
         param1.x = FlxU.floor(x + FlxU.roundingError) + FlxU.floor(FlxG.scroll.x * scrollFactor.x) - this.offset.x;
         param1.y = FlxU.floor(y + FlxU.roundingError) + FlxU.floor(FlxG.scroll.y * scrollFactor.y) - this.offset.y;
         return param1;
      }
      
      protected function calcFrame() : void
      {
         var _loc1_:uint = this._caf * this.frameWidth;
         var _loc2_:uint = 0;
         var _loc3_:uint = this._flipped ? this._flipped : uint(this._pixels.width);
         if(_loc1_ >= _loc3_)
         {
            _loc2_ = uint(_loc1_ / _loc3_) * this.frameHeight;
            _loc1_ %= _loc3_;
         }
         if(Boolean(this._flipped) && this._facing == LEFT)
         {
            _loc1_ = (this._flipped << 1) - _loc1_ - this.frameWidth;
         }
         this._flashRect.x = _loc1_;
         this._flashRect.y = _loc2_;
         this._framePixels.copyPixels(this._pixels,this._flashRect,this._flashPointZero);
         this._flashRect.x = this._flashRect.y = 0;
         if(this._ct != null)
         {
            this._framePixels.colorTransform(this._flashRect,this._ct);
         }
         if(FlxG.showBounds)
         {
            this.drawBounds();
         }
         if(this._callback != null)
         {
            this._callback(this._curAnim.name,this._curFrame,this._caf);
         }
      }
      
      protected function drawBounds() : void
      {
         var _loc1_:uint = getBoundingColor();
         this._bbb.fillRect(this._flashRect,0);
         var _loc2_:uint = this._flashRect.width;
         var _loc3_:uint = this._flashRect.height;
         this._flashRect.width = width;
         this._flashRect.height = height;
         this._flashRect.x = int(this.offset.x);
         this._flashRect.y = int(this.offset.y);
         this._bbb.fillRect(this._flashRect,_loc1_);
         this._flashRect.width -= 2;
         this._flashRect.height -= 2;
         ++this._flashRect.x;
         ++this._flashRect.y;
         this._bbb.fillRect(this._flashRect,0);
         this._flashRect.width = _loc2_;
         this._flashRect.height = _loc3_;
         this._flashRect.x = this._flashRect.y = 0;
         this._framePixels.copyPixels(this._bbb,this._flashRect,this._flashPointZero,null,null,true);
      }
      
      internal function unsafeBind(param1:BitmapData) : void
      {
         this._pixels = this._framePixels = param1;
      }
      
      public function changeAnimFrameRate(param1:String, param2:Number) : void
      {
         var _loc3_:int = 0;
         while(_loc3_ < this._animations.length)
         {
            if(this._animations[_loc3_].name == param1)
            {
               this._animations[_loc3_].delay = 1 / param2;
               return;
            }
            _loc3_++;
         }
      }
   }
}

