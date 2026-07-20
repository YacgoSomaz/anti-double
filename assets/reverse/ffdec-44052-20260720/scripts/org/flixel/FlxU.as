package org.flixel
{
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   import flash.utils.getDefinitionByName;
   import flash.utils.getQualifiedClassName;
   import flash.utils.getTimer;
   
   public class FlxU
   {
      
      protected static var _seed:Number;
      
      protected static var _originalSeed:Number;
      
      public static var quadTree:FlxQuadTree;
      
      public static var quadTreeBounds:FlxRect;
      
      internal static var roundingError:Number = 1e-7;
      
      public static var quadTreeDivisions:uint = 3;
      
      public function FlxU()
      {
         super();
      }
      
      public static function openURL(param1:String) : void
      {
         navigateToURL(new URLRequest(param1),"_blank");
      }
      
      public static function abs(param1:Number) : Number
      {
         return param1 > 0 ? param1 : -param1;
      }
      
      public static function floor(param1:Number) : Number
      {
         var _loc2_:Number = int(param1);
         return param1 > 0 ? _loc2_ : (_loc2_ != param1 ? _loc2_ - 1 : _loc2_);
      }
      
      public static function ceil(param1:Number) : Number
      {
         var _loc2_:Number = int(param1);
         return param1 > 0 ? (_loc2_ != param1 ? _loc2_ + 1 : _loc2_) : _loc2_;
      }
      
      public static function random(param1:Boolean = true) : Number
      {
         var _loc2_:Number = NaN;
         if(param1 && !isNaN(_seed))
         {
            _loc2_ = randomize(_seed);
            _seed = mutate(_seed,_loc2_);
            return _loc2_;
         }
         return Math.random();
      }
      
      public static function randomize(param1:Number) : Number
      {
         return 69621 * int(param1 * 2147483647) % 2147483647 / 2147483647;
      }
      
      public static function mutate(param1:Number, param2:Number) : Number
      {
         param1 += param2;
         if(param1 > 1)
         {
            param1 -= int(param1);
         }
         return param1;
      }
      
      public static function get seed() : Number
      {
         return _originalSeed;
      }
      
      public static function set seed(param1:Number) : void
      {
         _seed = param1;
         _originalSeed = _seed;
      }
      
      public static function startProfile() : uint
      {
         return getTimer();
      }
      
      public static function endProfile(param1:uint, param2:String = "Profiler", param3:Boolean = true) : uint
      {
         var _loc4_:uint = uint(getTimer());
         if(param3)
         {
            FlxG.log(param2 + ": " + (_loc4_ - param1) / 1000 + "s");
         }
         return _loc4_;
      }
      
      public static function rotatePoint(param1:Number, param2:Number, param3:Number, param4:Number, param5:Number, param6:FlxPoint = null) : FlxPoint
      {
         if(param6 == null)
         {
            param6 = new FlxPoint();
         }
         var _loc7_:Number = -param5 / 180 * Math.PI;
         var _loc8_:Number = param1 - param3;
         var _loc9_:Number = param4 - param2;
         param6.x = param3 + Math.cos(_loc7_) * _loc8_ - Math.sin(_loc7_) * _loc9_;
         param6.y = param4 - (Math.sin(_loc7_) * _loc8_ + Math.cos(_loc7_) * _loc9_);
         return param6;
      }
      
      public static function getAngle(param1:Number, param2:Number) : Number
      {
         return Math.atan2(param2,param1) * 180 / Math.PI;
      }
      
      public static function getClassName(param1:Object, param2:Boolean = false) : String
      {
         var _loc3_:String = getQualifiedClassName(param1);
         _loc3_ = _loc3_.replace("::",".");
         if(param2)
         {
            _loc3_ = _loc3_.substr(_loc3_.lastIndexOf(".") + 1);
         }
         return _loc3_;
      }
      
      public static function getClass(param1:String) : Class
      {
         return getDefinitionByName(param1) as Class;
      }
      
      public static function computeVelocity(param1:Number, param2:Number = 0, param3:Number = 0, param4:Number = 10000) : Number
      {
         var _loc5_:Number = NaN;
         if(param2 != 0)
         {
            param1 += param2 * FlxG.elapsed;
         }
         else if(param3 != 0)
         {
            _loc5_ = param3 * FlxG.elapsed;
            if(param1 - _loc5_ > 0)
            {
               param1 -= _loc5_;
            }
            else if(param1 + _loc5_ < 0)
            {
               param1 += _loc5_;
            }
            else
            {
               param1 = 0;
            }
         }
         if(param1 != 0 && param4 != 10000)
         {
            if(param1 > param4)
            {
               param1 = param4;
            }
            else if(param1 < -param4)
            {
               param1 = -param4;
            }
         }
         return param1;
      }
      
      public static function setWorldBounds(param1:Number = 0, param2:Number = 0, param3:Number = 0, param4:Number = 0, param5:uint = 3) : void
      {
         if(quadTreeBounds == null)
         {
            quadTreeBounds = new FlxRect();
         }
         quadTreeBounds.x = param1;
         quadTreeBounds.y = param2;
         if(param3 > 0)
         {
            quadTreeBounds.width = param3;
         }
         if(param4 > 0)
         {
            quadTreeBounds.height = param4;
         }
         if(param5 > 0)
         {
            quadTreeDivisions = param5;
         }
      }
      
      public static function overlap(param1:FlxObject, param2:FlxObject, param3:Function = null) : Boolean
      {
         if(param1 == null || !param1.exists || param2 == null || !param2.exists)
         {
            return false;
         }
         quadTree = new FlxQuadTree(quadTreeBounds.x,quadTreeBounds.y,quadTreeBounds.width,quadTreeBounds.height);
         quadTree.add(param1,FlxQuadTree.A_LIST);
         if(param1 === param2)
         {
            return quadTree.overlap(false,param3);
         }
         quadTree.add(param2,FlxQuadTree.B_LIST);
         return quadTree.overlap(true,param3);
      }
      
      public static function collide(param1:FlxObject, param2:FlxObject) : Boolean
      {
         if(param1 == null || !param1.exists || param2 == null || !param2.exists)
         {
            return false;
         }
         quadTree = new FlxQuadTree(quadTreeBounds.x,quadTreeBounds.y,quadTreeBounds.width,quadTreeBounds.height);
         quadTree.add(param1,FlxQuadTree.A_LIST);
         var _loc3_:Boolean = param1 === param2;
         if(!_loc3_)
         {
            quadTree.add(param2,FlxQuadTree.B_LIST);
         }
         var _loc4_:Boolean = quadTree.overlap(!_loc3_,solveXCollision);
         var _loc5_:Boolean = quadTree.overlap(!_loc3_,solveYCollision);
         return _loc4_ || _loc5_;
      }
      
      public static function solveXCollision(param1:FlxObject, param2:FlxObject) : Boolean
      {
         var _loc5_:Boolean = false;
         var _loc6_:Boolean = false;
         var _loc7_:Number = NaN;
         var _loc9_:Boolean = false;
         var _loc16_:uint = 0;
         var _loc17_:uint = 0;
         var _loc24_:Number = NaN;
         var _loc25_:Number = NaN;
         var _loc26_:Number = NaN;
         var _loc27_:Number = NaN;
         var _loc28_:Number = NaN;
         var _loc29_:Number = NaN;
         var _loc30_:Number = NaN;
         var _loc31_:Number = NaN;
         var _loc3_:Number = param1.colVector.x;
         var _loc4_:Number = param2.colVector.x;
         if(_loc3_ == _loc4_)
         {
            return false;
         }
         param1.preCollide(param2);
         param2.preCollide(param1);
         var _loc8_:Boolean = false;
         var _loc10_:Boolean = _loc3_ == 0;
         var _loc11_:Boolean = _loc3_ < 0;
         var _loc12_:Boolean = _loc3_ > 0;
         var _loc13_:Boolean = _loc4_ == 0;
         var _loc14_:Boolean = _loc4_ < 0;
         var _loc15_:Boolean = _loc4_ > 0;
         var _loc18_:FlxRect = param1.colHullX;
         var _loc19_:FlxRect = param2.colHullX;
         var _loc20_:Array = param1.colOffsets;
         var _loc21_:Array = param2.colOffsets;
         var _loc22_:uint = _loc20_.length;
         var _loc23_:uint = _loc21_.length;
         _loc9_ = _loc10_ && _loc14_ || _loc12_ && _loc13_ || _loc12_ && _loc14_ || _loc11_ && _loc14_ && (_loc3_ > 0 ? _loc3_ : -_loc3_) < (_loc4_ > 0 ? _loc4_ : -_loc4_) || _loc12_ && _loc15_ && (_loc3_ > 0 ? _loc3_ : -_loc3_) > (_loc4_ > 0 ? _loc4_ : -_loc4_);
         if(_loc9_ ? !param1.collideRight || !param2.collideLeft : !param1.collideLeft || !param2.collideRight)
         {
            return false;
         }
         _loc16_ = 0;
         while(_loc16_ < _loc22_)
         {
            _loc24_ = Number(_loc20_[_loc16_].x);
            _loc25_ = Number(_loc20_[_loc16_].y);
            _loc18_.x += _loc24_;
            _loc18_.y += _loc25_;
            _loc17_ = 0;
            while(_loc17_ < _loc23_)
            {
               _loc26_ = Number(_loc21_[_loc17_].x);
               _loc27_ = Number(_loc21_[_loc17_].y);
               _loc19_.x += _loc26_;
               _loc19_.y += _loc27_;
               if(_loc18_.x + _loc18_.width < _loc19_.x + roundingError || _loc18_.x + roundingError > _loc19_.x + _loc19_.width || _loc18_.y + _loc18_.height < _loc19_.y + roundingError || _loc18_.y + roundingError > _loc19_.y + _loc19_.height)
               {
                  _loc19_.x -= _loc26_;
                  _loc19_.y -= _loc27_;
               }
               else
               {
                  if(_loc9_)
                  {
                     if(_loc11_)
                     {
                        _loc28_ = _loc18_.x + param1.colHullY.width;
                     }
                     else
                     {
                        _loc28_ = _loc18_.x + _loc18_.width;
                     }
                     if(_loc14_)
                     {
                        _loc29_ = _loc19_.x;
                     }
                     else
                     {
                        _loc29_ = _loc19_.x + _loc19_.width - param2.colHullY.width;
                     }
                  }
                  else
                  {
                     if(_loc14_)
                     {
                        _loc28_ = -_loc19_.x - param2.colHullY.width;
                     }
                     else
                     {
                        _loc28_ = -_loc19_.x - _loc19_.width;
                     }
                     if(_loc11_)
                     {
                        _loc29_ = -_loc18_.x;
                     }
                     else
                     {
                        _loc29_ = -_loc18_.x - _loc18_.width + param1.colHullY.width;
                     }
                  }
                  _loc7_ = _loc28_ - _loc29_;
                  if(_loc7_ == 0 || !param1.fixed && (_loc7_ > 0 ? _loc7_ : -_loc7_) > _loc18_.width * 0.8 || !param2.fixed && (_loc7_ > 0 ? _loc7_ : -_loc7_) > _loc19_.width * 0.8)
                  {
                     _loc19_.x -= _loc26_;
                     _loc19_.y -= _loc27_;
                  }
                  else
                  {
                     _loc8_ = true;
                     _loc30_ = param2.velocity.x;
                     _loc31_ = param1.velocity.x;
                     if(!param1.fixed && param2.fixed)
                     {
                        if(param1._group)
                        {
                           param1.reset(param1.x - _loc7_,param1.y);
                        }
                        else
                        {
                           param1.x -= _loc7_;
                        }
                     }
                     else if(param1.fixed && !param2.fixed)
                     {
                        if(param2._group)
                        {
                           param2.reset(param2.x + _loc7_,param2.y);
                        }
                        else
                        {
                           param2.x += _loc7_;
                        }
                     }
                     else if(!param1.fixed && !param2.fixed)
                     {
                        _loc7_ /= 2;
                        if(param1._group)
                        {
                           param1.reset(param1.x - _loc7_,param1.y);
                        }
                        else
                        {
                           param1.x -= _loc7_;
                        }
                        if(param2._group)
                        {
                           param2.reset(param2.x + _loc7_,param2.y);
                        }
                        else
                        {
                           param2.x += _loc7_;
                        }
                        _loc30_ /= 2;
                        _loc31_ /= 2;
                     }
                     if(_loc9_)
                     {
                        param1.hitRight(param2,_loc30_);
                        param2.hitLeft(param1,_loc31_);
                     }
                     else
                     {
                        param1.hitLeft(param2,_loc30_);
                        param2.hitRight(param1,_loc31_);
                     }
                     if(!param1.fixed && _loc7_ != 0)
                     {
                        if(_loc9_)
                        {
                           _loc18_.width -= _loc7_;
                        }
                        else
                        {
                           _loc18_.x -= _loc7_;
                           _loc18_.width += _loc7_;
                        }
                        param1.colHullY.x -= _loc7_;
                     }
                     if(!param2.fixed && _loc7_ != 0)
                     {
                        if(_loc9_)
                        {
                           _loc19_.x += _loc7_;
                           _loc19_.width -= _loc7_;
                        }
                        else
                        {
                           _loc19_.width += _loc7_;
                        }
                        param2.colHullY.x += _loc7_;
                     }
                     _loc19_.x -= _loc26_;
                     _loc19_.y -= _loc27_;
                  }
               }
               _loc17_++;
            }
            _loc18_.x -= _loc24_;
            _loc18_.y -= _loc25_;
            _loc16_++;
         }
         return _loc8_;
      }
      
      public static function solveYCollision(param1:FlxObject, param2:FlxObject) : Boolean
      {
         var _loc5_:Number = NaN;
         var _loc7_:Boolean = false;
         var _loc14_:uint = 0;
         var _loc15_:uint = 0;
         var _loc22_:Number = NaN;
         var _loc23_:Number = NaN;
         var _loc24_:Number = NaN;
         var _loc25_:Number = NaN;
         var _loc26_:Number = NaN;
         var _loc27_:Number = NaN;
         var _loc28_:Number = NaN;
         var _loc29_:Number = NaN;
         var _loc3_:Number = param1.colVector.y;
         var _loc4_:Number = param2.colVector.y;
         if(_loc3_ == _loc4_)
         {
            return false;
         }
         param1.preCollide(param2);
         param2.preCollide(param1);
         var _loc6_:Boolean = false;
         var _loc8_:Boolean = _loc3_ == 0;
         var _loc9_:Boolean = _loc3_ < 0;
         var _loc10_:Boolean = _loc3_ > 0;
         var _loc11_:Boolean = _loc4_ == 0;
         var _loc12_:Boolean = _loc4_ < 0;
         var _loc13_:Boolean = _loc4_ > 0;
         var _loc16_:FlxRect = param1.colHullY;
         var _loc17_:FlxRect = param2.colHullY;
         var _loc18_:Array = param1.colOffsets;
         var _loc19_:Array = param2.colOffsets;
         var _loc20_:uint = _loc18_.length;
         var _loc21_:uint = _loc19_.length;
         _loc7_ = _loc8_ && _loc12_ || _loc10_ && _loc11_ || _loc10_ && _loc12_ || _loc9_ && _loc12_ && (_loc3_ > 0 ? _loc3_ : -_loc3_) < (_loc4_ > 0 ? _loc4_ : -_loc4_) || _loc10_ && _loc13_ && (_loc3_ > 0 ? _loc3_ : -_loc3_) > (_loc4_ > 0 ? _loc4_ : -_loc4_);
         if(_loc7_ ? !param1.collideBottom || !param2.collideTop : !param1.collideTop || !param2.collideBottom)
         {
            return false;
         }
         _loc14_ = 0;
         while(_loc14_ < _loc20_)
         {
            _loc22_ = Number(_loc18_[_loc14_].x);
            _loc23_ = Number(_loc18_[_loc14_].y);
            _loc16_.x += _loc22_;
            _loc16_.y += _loc23_;
            _loc15_ = 0;
            while(_loc15_ < _loc21_)
            {
               _loc24_ = Number(_loc19_[_loc15_].x);
               _loc25_ = Number(_loc19_[_loc15_].y);
               _loc17_.x += _loc24_;
               _loc17_.y += _loc25_;
               if(_loc16_.x + _loc16_.width < _loc17_.x + roundingError || _loc16_.x + roundingError > _loc17_.x + _loc17_.width || _loc16_.y + _loc16_.height < _loc17_.y + roundingError || _loc16_.y + roundingError > _loc17_.y + _loc17_.height)
               {
                  _loc17_.x -= _loc24_;
                  _loc17_.y -= _loc25_;
               }
               else
               {
                  if(_loc7_)
                  {
                     if(_loc9_)
                     {
                        _loc26_ = _loc16_.y + param1.colHullX.height;
                     }
                     else
                     {
                        _loc26_ = _loc16_.y + _loc16_.height;
                     }
                     if(_loc12_)
                     {
                        _loc27_ = _loc17_.y;
                     }
                     else
                     {
                        _loc27_ = _loc17_.y + _loc17_.height - param2.colHullX.height;
                     }
                  }
                  else
                  {
                     if(_loc12_)
                     {
                        _loc26_ = -_loc17_.y - param2.colHullX.height;
                     }
                     else
                     {
                        _loc26_ = -_loc17_.y - _loc17_.height;
                     }
                     if(_loc9_)
                     {
                        _loc27_ = -_loc16_.y;
                     }
                     else
                     {
                        _loc27_ = -_loc16_.y - _loc16_.height + param1.colHullX.height;
                     }
                  }
                  _loc5_ = _loc26_ - _loc27_;
                  if(_loc5_ == 0 || !param1.fixed && (_loc5_ > 0 ? _loc5_ : -_loc5_) > _loc16_.height * 0.8 || !param2.fixed && (_loc5_ > 0 ? _loc5_ : -_loc5_) > _loc17_.height * 0.8)
                  {
                     _loc17_.x -= _loc24_;
                     _loc17_.y -= _loc25_;
                  }
                  else
                  {
                     _loc6_ = true;
                     _loc28_ = param2.velocity.y;
                     _loc29_ = param1.velocity.y;
                     if(!param1.fixed && param2.fixed)
                     {
                        if(param1._group)
                        {
                           param1.reset(param1.x,param1.y - _loc5_);
                        }
                        else
                        {
                           param1.y -= _loc5_;
                        }
                     }
                     else if(param1.fixed && !param2.fixed)
                     {
                        if(param2._group)
                        {
                           param2.reset(param2.x,param2.y + _loc5_);
                        }
                        else
                        {
                           param2.y += _loc5_;
                        }
                     }
                     else if(!param1.fixed && !param2.fixed)
                     {
                        _loc5_ /= 2;
                        if(param1._group)
                        {
                           param1.reset(param1.x,param1.y - _loc5_);
                        }
                        else
                        {
                           param1.y -= _loc5_;
                        }
                        if(param2._group)
                        {
                           param2.reset(param2.x,param2.y + _loc5_);
                        }
                        else
                        {
                           param2.y += _loc5_;
                        }
                        _loc28_ /= 2;
                        _loc29_ /= 2;
                     }
                     if(_loc7_)
                     {
                        param1.hitBottom(param2,_loc28_);
                        param2.hitTop(param1,_loc29_);
                     }
                     else
                     {
                        param1.hitTop(param2,_loc28_);
                        param2.hitBottom(param1,_loc29_);
                     }
                     if(!param1.fixed && _loc5_ != 0)
                     {
                        if(_loc7_)
                        {
                           _loc16_.y -= _loc5_;
                           if(param2.fixed && param2.moves)
                           {
                              _loc28_ = param2.colVector.x;
                              param1.x += _loc28_;
                              _loc16_.x += _loc28_;
                              param1.colHullX.x += _loc28_;
                           }
                        }
                        else
                        {
                           _loc16_.y -= _loc5_;
                           _loc16_.height += _loc5_;
                        }
                     }
                     if(!param2.fixed && _loc5_ != 0)
                     {
                        if(_loc7_)
                        {
                           _loc17_.y += _loc5_;
                           _loc17_.height -= _loc5_;
                        }
                        else
                        {
                           _loc17_.height += _loc5_;
                           if(param1.fixed && param1.moves)
                           {
                              _loc29_ = param1.colVector.x;
                              param2.x += _loc29_;
                              _loc17_.x += _loc29_;
                              param2.colHullX.x += _loc29_;
                           }
                        }
                     }
                     _loc17_.x -= _loc24_;
                     _loc17_.y -= _loc25_;
                  }
               }
               _loc15_++;
            }
            _loc16_.x -= _loc22_;
            _loc16_.y -= _loc23_;
            _loc14_++;
         }
         return _loc6_;
      }
   }
}

