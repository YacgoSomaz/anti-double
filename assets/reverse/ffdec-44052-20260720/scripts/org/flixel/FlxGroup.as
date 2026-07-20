package org.flixel
{
   public class FlxGroup extends FlxObject
   {
      
      public var members:Array;
      
      public var firstMember:uint = 0;
      
      public var usedLength:int = -1;
      
      public var cull:Boolean = false;
      
      protected var _last:FlxPoint;
      
      protected var _first:Boolean;
      
      public function FlxGroup()
      {
         super();
         _group = true;
         solid = false;
         this.members = new Array();
         this._last = new FlxPoint();
         this._first = true;
      }
      
      public function add(param1:FlxObject, param2:Boolean = false) : FlxObject
      {
         this.members.push(param1);
         if(param2)
         {
            param1.scrollFactor = scrollFactor;
         }
         return param1;
      }
      
      public function replace(param1:FlxObject, param2:FlxObject) : FlxObject
      {
         var _loc3_:int = this.members.indexOf(param1);
         if(_loc3_ < 0 || _loc3_ >= this.members.length)
         {
            return null;
         }
         this.members[_loc3_] = param2;
         return param2;
      }
      
      public function remove(param1:FlxObject, param2:Boolean = false) : FlxObject
      {
         var _loc3_:int = this.members.indexOf(param1);
         if(_loc3_ < 0 || _loc3_ >= this.members.length)
         {
            return null;
         }
         if(param2)
         {
            this.members.splice(_loc3_,1);
         }
         else
         {
            this.members[_loc3_] = null;
         }
         return param1;
      }
      
      public function getFirstAvail() : FlxObject
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null && !_loc1_.exists)
            {
               return _loc1_;
            }
            _loc3_++;
         }
         return null;
      }
      
      public function getFirstNull() : int
      {
         var _loc1_:uint = this.members.length;
         var _loc2_:uint = 0;
         while(_loc2_ < _loc1_)
         {
            if(this.members[_loc2_] == null)
            {
               return _loc2_;
            }
            _loc2_++;
         }
         return -1;
      }
      
      public function resetFirstAvail(param1:Number = 0, param2:Number = 0) : Boolean
      {
         var _loc3_:FlxObject = this.getFirstAvail();
         if(_loc3_ == null)
         {
            return false;
         }
         _loc3_.reset(param1,param2);
         return true;
      }
      
      public function getFirstExtant() : FlxObject
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null && _loc1_.exists)
            {
               return _loc1_;
            }
            _loc3_++;
         }
         return null;
      }
      
      public function getFirstAlive() : FlxObject
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null && _loc1_.exists && !_loc1_.dead)
            {
               return _loc1_;
            }
            _loc3_++;
         }
         return null;
      }
      
      public function getFirstDead() : FlxObject
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null && _loc1_.dead)
            {
               return _loc1_;
            }
            _loc3_++;
         }
         return null;
      }
      
      public function countLiving() : int
      {
         var _loc1_:FlxObject = null;
         var _loc2_:int = -1;
         var _loc3_:uint = this.members.length;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            _loc1_ = this.members[_loc4_] as FlxObject;
            if(_loc1_ != null)
            {
               if(_loc2_ < 0)
               {
                  _loc2_ = 0;
               }
               if(_loc1_.exists && !_loc1_.dead)
               {
                  _loc2_++;
               }
            }
            _loc4_++;
         }
         return _loc2_;
      }
      
      public function countDead() : int
      {
         var _loc1_:FlxObject = null;
         var _loc2_:int = -1;
         var _loc3_:uint = this.members.length;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            _loc1_ = this.members[_loc4_] as FlxObject;
            if(_loc1_ != null)
            {
               if(_loc2_ < 0)
               {
                  _loc2_ = 0;
               }
               if(_loc1_.dead)
               {
                  _loc2_++;
               }
            }
            _loc4_++;
         }
         return _loc2_;
      }
      
      public function countOnScreen() : int
      {
         var _loc1_:FlxObject = null;
         var _loc2_:int = -1;
         var _loc3_:uint = this.members.length;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            _loc1_ = this.members[_loc4_] as FlxObject;
            if(_loc1_ != null)
            {
               if(_loc2_ < 0)
               {
                  _loc2_ = 0;
               }
               if(_loc1_.onScreen())
               {
                  _loc2_++;
               }
            }
            _loc4_++;
         }
         return _loc2_;
      }
      
      public function getRandom() : FlxObject
      {
         var _loc1_:uint = 0;
         var _loc2_:FlxObject = null;
         var _loc3_:uint = this.members.length;
         var _loc4_:uint = uint(FlxU.random() * _loc3_);
         while(_loc2_ == null && _loc1_ < this.members.length)
         {
            _loc2_ = this.members[++_loc4_ % _loc3_] as FlxObject;
            _loc1_++;
         }
         return _loc2_;
      }
      
      protected function saveOldPosition() : void
      {
         if(this._first)
         {
            this._first = false;
            this._last.x = 0;
            this._last.y = 0;
            return;
         }
         this._last.x = x;
         this._last.y = y;
      }
      
      protected function updateMembers() : void
      {
         var _loc1_:Number = NaN;
         var _loc2_:Number = NaN;
         var _loc4_:FlxObject = null;
         var _loc3_:Boolean = false;
         if(x != this._last.x || y != this._last.y)
         {
            _loc3_ = true;
            _loc1_ = x - this._last.x;
            _loc2_ = y - this._last.y;
         }
         var _loc5_:uint = this.members.length;
         if(!this.cull || this.usedLength == -1)
         {
            this.usedLength = _loc5_;
         }
         if(!this.cull)
         {
            this.firstMember = 0;
         }
         var _loc6_:uint = this.firstMember;
         while(_loc6_ < this.usedLength)
         {
            _loc4_ = this.members[_loc6_] as FlxObject;
            if(_loc4_ != null && _loc4_.exists)
            {
               if(_loc3_)
               {
                  if(_loc4_._group)
                  {
                     _loc4_.reset(_loc4_.x + _loc1_,_loc4_.y + _loc2_);
                  }
                  else
                  {
                     _loc4_.x += _loc1_;
                     _loc4_.y += _loc2_;
                  }
               }
               if(_loc4_.active)
               {
                  _loc4_.update();
               }
               if(_loc3_ && _loc4_.solid)
               {
                  _loc4_.colHullX.width += _loc1_ > 0 ? _loc1_ : -_loc1_;
                  if(_loc1_ < 0)
                  {
                     _loc4_.colHullX.x += _loc1_;
                  }
                  _loc4_.colHullY.x = x;
                  _loc4_.colHullY.height += _loc2_ > 0 ? _loc2_ : -_loc2_;
                  if(_loc2_ < 0)
                  {
                     _loc4_.colHullY.y += _loc2_;
                  }
                  _loc4_.colVector.x += _loc1_;
                  _loc4_.colVector.y += _loc2_;
               }
            }
            _loc6_++;
         }
      }
      
      override public function update() : void
      {
         this.saveOldPosition();
         updateMotion();
         this.updateMembers();
         updateFlickering();
      }
      
      protected function renderMembers() : void
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         if(!this.cull || this.usedLength == -1)
         {
            this.usedLength = _loc2_;
         }
         if(!this.cull)
         {
            this.firstMember = 0;
         }
         var _loc3_:uint = this.firstMember;
         while(_loc3_ < this.usedLength)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null && _loc1_.exists && _loc1_.visible)
            {
               _loc1_.render();
            }
            _loc3_++;
         }
      }
      
      override public function render() : void
      {
         this.renderMembers();
      }
      
      protected function killMembers() : void
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null)
            {
               _loc1_.kill();
            }
            _loc3_++;
         }
      }
      
      override public function kill() : void
      {
         this.killMembers();
         super.kill();
      }
      
      protected function destroyMembers() : void
      {
         var _loc1_:FlxObject = null;
         var _loc2_:uint = this.members.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = this.members[_loc3_] as FlxObject;
            if(_loc1_ != null)
            {
               _loc1_.destroy();
            }
            _loc3_++;
         }
         this.members.length = 0;
      }
      
      override public function destroy() : void
      {
         this.destroyMembers();
         super.destroy();
      }
      
      override public function reset(param1:Number, param2:Number) : void
      {
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc6_:FlxObject = null;
         this.saveOldPosition();
         super.reset(param1,param2);
         var _loc5_:Boolean = false;
         if(x != this._last.x || y != this._last.y)
         {
            _loc5_ = true;
            _loc3_ = x - this._last.x;
            _loc4_ = y - this._last.y;
         }
         var _loc7_:uint = this.members.length;
         var _loc8_:uint = 0;
         while(_loc8_ < _loc7_)
         {
            _loc6_ = this.members[_loc8_] as FlxObject;
            if(_loc6_ != null && _loc6_.exists)
            {
               if(_loc5_)
               {
                  if(_loc6_._group)
                  {
                     _loc6_.reset(_loc6_.x + _loc3_,_loc6_.y + _loc4_);
                  }
                  else
                  {
                     _loc6_.x += _loc3_;
                     _loc6_.y += _loc4_;
                     if(solid)
                     {
                        _loc6_.colHullX.width += _loc3_ > 0 ? _loc3_ : -_loc3_;
                        if(_loc3_ < 0)
                        {
                           _loc6_.colHullX.x += _loc3_;
                        }
                        _loc6_.colHullY.x = x;
                        _loc6_.colHullY.height += _loc4_ > 0 ? _loc4_ : -_loc4_;
                        if(_loc4_ < 0)
                        {
                           _loc6_.colHullY.y += _loc4_;
                        }
                        _loc6_.colVector.x += _loc3_;
                        _loc6_.colVector.y += _loc4_;
                     }
                  }
               }
            }
            _loc8_++;
         }
      }
   }
}

