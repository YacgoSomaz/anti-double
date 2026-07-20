package org.flixel
{
   import flash.geom.Point;
   
   public class FlxObject extends FlxRect
   {
      
      internal static var _refreshBounds:Boolean;
      
      protected static const _pZero:FlxPoint = new FlxPoint();
      
      public var exists:Boolean;
      
      public var active:Boolean;
      
      public var visible:Boolean;
      
      protected var _solid:Boolean;
      
      protected var _fixed:Boolean;
      
      public var velocity:FlxPoint;
      
      public var acceleration:FlxPoint;
      
      public var drag:FlxPoint;
      
      public var maxVelocity:FlxPoint;
      
      public var angle:Number;
      
      public var angularVelocity:Number;
      
      public var angularAcceleration:Number;
      
      public var angularDrag:Number;
      
      public var maxAngular:Number;
      
      public var origin:FlxPoint;
      
      public var thrust:Number;
      
      public var maxThrust:Number;
      
      public var scrollFactor:FlxPoint;
      
      protected var _flicker:Boolean;
      
      protected var _flickerTimer:Number;
      
      public var health:Number;
      
      public var dead:Boolean;
      
      protected var _point:FlxPoint;
      
      protected var _rect:FlxRect;
      
      protected var _flashPoint:Point;
      
      public var moves:Boolean;
      
      public var colHullX:FlxRect;
      
      public var colHullY:FlxRect;
      
      public var colVector:FlxPoint;
      
      public var colOffsets:Array;
      
      internal var _group:Boolean;
      
      public var onFloor:Boolean;
      
      public var collideLeft:Boolean;
      
      public var collideRight:Boolean;
      
      public var collideTop:Boolean;
      
      public var collideBottom:Boolean;
      
      public function FlxObject(param1:Number = 0, param2:Number = 0, param3:Number = 0, param4:Number = 0)
      {
         super(param1,param2,param3,param4);
         this.exists = true;
         this.active = true;
         this.visible = true;
         this._solid = true;
         this._fixed = false;
         this.moves = true;
         this.collideLeft = true;
         this.collideRight = true;
         this.collideTop = true;
         this.collideBottom = true;
         this.origin = new FlxPoint();
         this.velocity = new FlxPoint();
         this.acceleration = new FlxPoint();
         this.drag = new FlxPoint();
         this.maxVelocity = new FlxPoint(10000,10000);
         this.angle = 0;
         this.angularVelocity = 0;
         this.angularAcceleration = 0;
         this.angularDrag = 0;
         this.maxAngular = 10000;
         this.thrust = 0;
         this.scrollFactor = new FlxPoint(1,1);
         this._flicker = false;
         this._flickerTimer = -1;
         this.health = 1;
         this.dead = false;
         this._point = new FlxPoint();
         this._rect = new FlxRect();
         this._flashPoint = new Point();
         this.colHullX = new FlxRect();
         this.colHullY = new FlxRect();
         this.colVector = new FlxPoint();
         this.colOffsets = new Array(new FlxPoint());
         this._group = false;
      }
      
      public function destroy() : void
      {
      }
      
      public function get solid() : Boolean
      {
         return this._solid;
      }
      
      public function set solid(param1:Boolean) : void
      {
         this._solid = param1;
      }
      
      public function get fixed() : Boolean
      {
         return this._fixed;
      }
      
      public function set fixed(param1:Boolean) : void
      {
         this._fixed = param1;
      }
      
      public function refreshHulls() : void
      {
         this.colHullX.x = x;
         this.colHullX.y = y;
         this.colHullX.width = width;
         this.colHullX.height = height;
         this.colHullY.x = x;
         this.colHullY.y = y;
         this.colHullY.width = width;
         this.colHullY.height = height;
      }
      
      protected function updateMotion() : void
      {
         var _loc1_:Number = NaN;
         var _loc2_:FlxPoint = null;
         var _loc5_:FlxPoint = null;
         var _loc6_:Number = NaN;
         if(!this.moves)
         {
            return;
         }
         if(this._solid)
         {
            this.refreshHulls();
         }
         this.onFloor = false;
         _loc1_ = (FlxU.computeVelocity(this.angularVelocity,this.angularAcceleration,this.angularDrag,this.maxAngular) - this.angularVelocity) / 2;
         this.angularVelocity += _loc1_;
         this.angle += this.angularVelocity * FlxG.elapsed;
         this.angularVelocity += _loc1_;
         if(this.thrust != 0)
         {
            _loc2_ = FlxU.rotatePoint(-this.thrust,0,0,0,this.angle);
            _loc5_ = FlxU.rotatePoint(-this.maxThrust,0,0,0,this.angle);
            _loc6_ = _loc5_.x > 0 ? _loc5_.x : -_loc5_.x;
            if(_loc6_ > (_loc5_.y > 0 ? _loc5_.y : -_loc5_.y))
            {
               _loc5_.y = _loc6_;
            }
            else
            {
               _loc6_ = _loc5_.y > 0 ? _loc5_.y : -_loc5_.y;
            }
            this.maxVelocity.x = this.maxVelocity.y = _loc6_ > 0 ? _loc6_ : -_loc6_;
         }
         else
         {
            _loc2_ = _pZero;
         }
         _loc1_ = (FlxU.computeVelocity(this.velocity.x,this.acceleration.x + _loc2_.x,this.drag.x,this.maxVelocity.x) - this.velocity.x) / 2;
         this.velocity.x += _loc1_;
         var _loc3_:Number = this.velocity.x * FlxG.elapsed;
         this.velocity.x += _loc1_;
         _loc1_ = (FlxU.computeVelocity(this.velocity.y,this.acceleration.y + _loc2_.y,this.drag.y,this.maxVelocity.y) - this.velocity.y) / 2;
         this.velocity.y += _loc1_;
         var _loc4_:Number = this.velocity.y * FlxG.elapsed;
         this.velocity.y += _loc1_;
         x += _loc3_;
         y += _loc4_;
         if(!this._solid)
         {
            return;
         }
         this.colVector.x = _loc3_;
         this.colVector.y = _loc4_;
         this.colHullX.width += this.colVector.x > 0 ? this.colVector.x : -this.colVector.x;
         if(this.colVector.x < 0)
         {
            this.colHullX.x += this.colVector.x;
         }
         this.colHullY.x = x;
         this.colHullY.height += this.colVector.y > 0 ? this.colVector.y : -this.colVector.y;
         if(this.colVector.y < 0)
         {
            this.colHullY.y += this.colVector.y;
         }
      }
      
      protected function updateFlickering() : void
      {
         if(this.flickering())
         {
            if(this._flickerTimer > 0)
            {
               this._flickerTimer -= FlxG.elapsed;
               if(this._flickerTimer == 0)
               {
                  this._flickerTimer = -1;
               }
            }
            if(this._flickerTimer < 0)
            {
               this.flicker(-1);
            }
            else
            {
               this._flicker = !this._flicker;
               this.visible = !this._flicker;
            }
         }
      }
      
      public function update() : void
      {
         this.updateMotion();
         this.updateFlickering();
      }
      
      public function render() : void
      {
      }
      
      public function overlaps(param1:FlxObject) : Boolean
      {
         var _loc10_:FlxSprite = null;
         var _loc11_:FlxSprite = null;
         this.getScreenXY(this._point);
         var _loc2_:Number = this._point.x;
         var _loc3_:Number = this._point.y;
         var _loc4_:Number = width;
         var _loc5_:Number = height;
         if(this is FlxSprite)
         {
            _loc10_ = this as FlxSprite;
            _loc4_ = _loc10_.frameWidth;
            _loc5_ = _loc10_.frameHeight;
         }
         param1.getScreenXY(this._point);
         var _loc6_:Number = this._point.x;
         var _loc7_:Number = this._point.y;
         var _loc8_:Number = param1.width;
         var _loc9_:Number = param1.height;
         if(param1 is FlxSprite)
         {
            _loc11_ = param1 as FlxSprite;
            _loc8_ = _loc11_.frameWidth;
            _loc9_ = _loc11_.frameHeight;
         }
         if(_loc6_ <= _loc2_ - _loc8_ || _loc6_ >= _loc2_ + _loc4_ || _loc7_ <= _loc3_ - _loc9_ || _loc7_ >= _loc3_ + _loc5_)
         {
            return false;
         }
         return true;
      }
      
      public function overlapsPoint(param1:Number, param2:Number, param3:Boolean = false) : Boolean
      {
         param1 += FlxU.floor(FlxG.scroll.x);
         param2 += FlxU.floor(FlxG.scroll.y);
         this.getScreenXY(this._point);
         if(param1 <= this._point.x || param1 >= this._point.x + width || param2 <= this._point.y || param2 >= this._point.y + height)
         {
            return false;
         }
         return true;
      }
      
      public function collide(param1:FlxObject = null) : Boolean
      {
         return FlxU.collide(this,param1 == null ? this : param1);
      }
      
      public function preCollide(param1:FlxObject) : void
      {
      }
      
      public function hitLeft(param1:FlxObject, param2:Number) : void
      {
         if(!this.fixed)
         {
            this.velocity.x = param2;
         }
      }
      
      public function hitRight(param1:FlxObject, param2:Number) : void
      {
         this.hitLeft(param1,param2);
      }
      
      public function hitTop(param1:FlxObject, param2:Number) : void
      {
         if(!this.fixed)
         {
            this.velocity.y = param2;
         }
      }
      
      public function hitBottom(param1:FlxObject, param2:Number) : void
      {
         this.onFloor = true;
         if(!this.fixed)
         {
            this.velocity.y = param2;
         }
      }
      
      public function hurt(param1:Number) : void
      {
         if((this.health = this.health - param1) <= 0)
         {
            this.kill();
         }
      }
      
      public function kill() : void
      {
         this.exists = false;
         this.dead = true;
      }
      
      public function flicker(param1:Number = 1) : void
      {
         this._flickerTimer = param1;
         if(this._flickerTimer < 0)
         {
            this._flicker = false;
            this.visible = true;
         }
      }
      
      public function flickering() : Boolean
      {
         return this._flickerTimer >= 0;
      }
      
      public function getScreenXY(param1:FlxPoint = null) : FlxPoint
      {
         if(param1 == null)
         {
            param1 = new FlxPoint();
         }
         param1.x = FlxU.floor(x + FlxU.roundingError) + FlxU.floor(FlxG.scroll.x * this.scrollFactor.x);
         param1.y = FlxU.floor(y + FlxU.roundingError) + FlxU.floor(FlxG.scroll.y * this.scrollFactor.y);
         return param1;
      }
      
      public function onScreen() : Boolean
      {
         this.getScreenXY(this._point);
         if(this._point.x + width < 0 || this._point.x > FlxG.width || this._point.y + height < 0 || this._point.y > FlxG.height)
         {
            return false;
         }
         return true;
      }
      
      public function reset(param1:Number, param2:Number) : void
      {
         x = param1;
         y = param2;
         this.exists = true;
         this.dead = false;
      }
      
      public function getBoundingColor() : uint
      {
         if(this.solid)
         {
            if(this.fixed)
            {
               return 2130768421;
            }
            return 2147418130;
         }
         return 2130743529;
      }
   }
}

