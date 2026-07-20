package org.flixel
{
   import org.flixel.data.FlxList;
   
   public class FlxQuadTree extends FlxRect
   {
      
      protected static var _min:uint;
      
      protected static var _o:FlxObject;
      
      protected static var _ol:Number;
      
      protected static var _ot:Number;
      
      protected static var _or:Number;
      
      protected static var _ob:Number;
      
      protected static var _oa:uint;
      
      protected static var _oc:Function;
      
      public static const A_LIST:uint = 0;
      
      public static const B_LIST:uint = 1;
      
      protected var _canSubdivide:Boolean;
      
      protected var _headA:FlxList;
      
      protected var _tailA:FlxList;
      
      protected var _headB:FlxList;
      
      protected var _tailB:FlxList;
      
      protected var _nw:FlxQuadTree;
      
      protected var _ne:FlxQuadTree;
      
      protected var _se:FlxQuadTree;
      
      protected var _sw:FlxQuadTree;
      
      protected var _l:Number;
      
      protected var _r:Number;
      
      protected var _t:Number;
      
      protected var _b:Number;
      
      protected var _hw:Number;
      
      protected var _hh:Number;
      
      protected var _mx:Number;
      
      protected var _my:Number;
      
      public function FlxQuadTree(param1:Number, param2:Number, param3:Number, param4:Number, param5:FlxQuadTree = null)
      {
         var _loc6_:FlxList = null;
         var _loc7_:FlxList = null;
         super(param1,param2,param3,param4);
         this._headA = this._tailA = new FlxList();
         this._headB = this._tailB = new FlxList();
         if(param5 != null)
         {
            if(param5._headA.object != null)
            {
               _loc6_ = param5._headA;
               while(_loc6_ != null)
               {
                  if(this._tailA.object != null)
                  {
                     _loc7_ = this._tailA;
                     this._tailA = new FlxList();
                     _loc7_.next = this._tailA;
                  }
                  this._tailA.object = _loc6_.object;
                  _loc6_ = _loc6_.next;
               }
            }
            if(param5._headB.object != null)
            {
               _loc6_ = param5._headB;
               while(_loc6_ != null)
               {
                  if(this._tailB.object != null)
                  {
                     _loc7_ = this._tailB;
                     this._tailB = new FlxList();
                     _loc7_.next = this._tailB;
                  }
                  this._tailB.object = _loc6_.object;
                  _loc6_ = _loc6_.next;
               }
            }
         }
         else
         {
            _min = (width + height) / (2 * FlxU.quadTreeDivisions);
         }
         this._canSubdivide = width > _min || height > _min;
         this._nw = null;
         this._ne = null;
         this._se = null;
         this._sw = null;
         this._l = x;
         this._r = x + width;
         this._hw = width / 2;
         this._mx = this._l + this._hw;
         this._t = y;
         this._b = y + height;
         this._hh = height / 2;
         this._my = this._t + this._hh;
      }
      
      public function add(param1:FlxObject, param2:uint) : void
      {
         var _loc3_:FlxObject = null;
         var _loc4_:Array = null;
         var _loc5_:uint = 0;
         var _loc6_:uint = 0;
         _oa = param2;
         if(param1._group)
         {
            _loc4_ = (param1 as FlxGroup).members;
            _loc5_ = _loc4_.length;
            _loc6_ = 0;
            while(_loc6_ < _loc5_)
            {
               _loc3_ = _loc4_[_loc6_] as FlxObject;
               if(_loc3_ != null && _loc3_.exists)
               {
                  if(_loc3_._group)
                  {
                     this.add(_loc3_,param2);
                  }
                  else if(_loc3_.solid)
                  {
                     _o = _loc3_;
                     _ol = _o.x;
                     _ot = _o.y;
                     _or = _o.x + _o.width;
                     _ob = _o.y + _o.height;
                     this.addObject();
                  }
               }
               _loc6_++;
            }
         }
         if(param1.solid)
         {
            _o = param1;
            _ol = _o.x;
            _ot = _o.y;
            _or = _o.x + _o.width;
            _ob = _o.y + _o.height;
            this.addObject();
         }
      }
      
      protected function addObject() : void
      {
         if(!this._canSubdivide || this._l >= _ol && this._r <= _or && this._t >= _ot && this._b <= _ob)
         {
            this.addToList();
            return;
         }
         if(_ol > this._l && _or < this._mx)
         {
            if(_ot > this._t && _ob < this._my)
            {
               if(this._nw == null)
               {
                  this._nw = new FlxQuadTree(this._l,this._t,this._hw,this._hh,this);
               }
               this._nw.addObject();
               return;
            }
            if(_ot > this._my && _ob < this._b)
            {
               if(this._sw == null)
               {
                  this._sw = new FlxQuadTree(this._l,this._my,this._hw,this._hh,this);
               }
               this._sw.addObject();
               return;
            }
         }
         if(_ol > this._mx && _or < this._r)
         {
            if(_ot > this._t && _ob < this._my)
            {
               if(this._ne == null)
               {
                  this._ne = new FlxQuadTree(this._mx,this._t,this._hw,this._hh,this);
               }
               this._ne.addObject();
               return;
            }
            if(_ot > this._my && _ob < this._b)
            {
               if(this._se == null)
               {
                  this._se = new FlxQuadTree(this._mx,this._my,this._hw,this._hh,this);
               }
               this._se.addObject();
               return;
            }
         }
         if(_or > this._l && _ol < this._mx && _ob > this._t && _ot < this._my)
         {
            if(this._nw == null)
            {
               this._nw = new FlxQuadTree(this._l,this._t,this._hw,this._hh,this);
            }
            this._nw.addObject();
         }
         if(_or > this._mx && _ol < this._r && _ob > this._t && _ot < this._my)
         {
            if(this._ne == null)
            {
               this._ne = new FlxQuadTree(this._mx,this._t,this._hw,this._hh,this);
            }
            this._ne.addObject();
         }
         if(_or > this._mx && _ol < this._r && _ob > this._my && _ot < this._b)
         {
            if(this._se == null)
            {
               this._se = new FlxQuadTree(this._mx,this._my,this._hw,this._hh,this);
            }
            this._se.addObject();
         }
         if(_or > this._l && _ol < this._mx && _ob > this._my && _ot < this._b)
         {
            if(this._sw == null)
            {
               this._sw = new FlxQuadTree(this._l,this._my,this._hw,this._hh,this);
            }
            this._sw.addObject();
         }
      }
      
      protected function addToList() : void
      {
         var _loc1_:FlxList = null;
         if(_oa == A_LIST)
         {
            if(this._tailA.object != null)
            {
               _loc1_ = this._tailA;
               this._tailA = new FlxList();
               _loc1_.next = this._tailA;
            }
            this._tailA.object = _o;
         }
         else
         {
            if(this._tailB.object != null)
            {
               _loc1_ = this._tailB;
               this._tailB = new FlxList();
               _loc1_.next = this._tailB;
            }
            this._tailB.object = _o;
         }
         if(!this._canSubdivide)
         {
            return;
         }
         if(this._nw != null)
         {
            this._nw.addToList();
         }
         if(this._ne != null)
         {
            this._ne.addToList();
         }
         if(this._se != null)
         {
            this._se.addToList();
         }
         if(this._sw != null)
         {
            this._sw.addToList();
         }
      }
      
      public function overlap(param1:Boolean = true, param2:Function = null) : Boolean
      {
         var _loc4_:FlxList = null;
         _oc = param2;
         var _loc3_:Boolean = false;
         if(param1)
         {
            _oa = B_LIST;
            if(this._headA.object != null)
            {
               _loc4_ = this._headA;
               while(_loc4_ != null)
               {
                  _o = _loc4_.object;
                  if(_o.exists && _o.solid && this.overlapNode())
                  {
                     _loc3_ = true;
                  }
                  _loc4_ = _loc4_.next;
               }
            }
            _oa = A_LIST;
            if(this._headB.object != null)
            {
               _loc4_ = this._headB;
               while(_loc4_ != null)
               {
                  _o = _loc4_.object;
                  if(_o.exists && _o.solid)
                  {
                     if(this._nw != null && this._nw.overlapNode())
                     {
                        _loc3_ = true;
                     }
                     if(this._ne != null && this._ne.overlapNode())
                     {
                        _loc3_ = true;
                     }
                     if(this._se != null && this._se.overlapNode())
                     {
                        _loc3_ = true;
                     }
                     if(this._sw != null && this._sw.overlapNode())
                     {
                        _loc3_ = true;
                     }
                  }
                  _loc4_ = _loc4_.next;
               }
            }
         }
         else if(this._headA.object != null)
         {
            _loc4_ = this._headA;
            while(_loc4_ != null)
            {
               _o = _loc4_.object;
               if(_o.exists && _o.solid && this.overlapNode(_loc4_.next))
               {
                  _loc3_ = true;
               }
               _loc4_ = _loc4_.next;
            }
         }
         if(this._nw != null && this._nw.overlap(param1,_oc))
         {
            _loc3_ = true;
         }
         if(this._ne != null && this._ne.overlap(param1,_oc))
         {
            _loc3_ = true;
         }
         if(this._se != null && this._se.overlap(param1,_oc))
         {
            _loc3_ = true;
         }
         if(this._sw != null && this._sw.overlap(param1,_oc))
         {
            _loc3_ = true;
         }
         return _loc3_;
      }
      
      protected function overlapNode(param1:FlxList = null) : Boolean
      {
         var _loc3_:FlxObject = null;
         var _loc2_:Boolean = false;
         var _loc4_:FlxList = param1;
         if(_loc4_ == null)
         {
            if(_oa == A_LIST)
            {
               _loc4_ = this._headA;
            }
            else
            {
               _loc4_ = this._headB;
            }
         }
         if(_loc4_.object != null)
         {
            while(_loc4_ != null)
            {
               _loc3_ = _loc4_.object;
               if(_o === _loc3_ || !_loc3_.exists || !_o.exists || !_loc3_.solid || !_o.solid || _o.x + _o.width < _loc3_.x + FlxU.roundingError || _o.x + FlxU.roundingError > _loc3_.x + _loc3_.width || _o.y + _o.height < _loc3_.y + FlxU.roundingError || _o.y + FlxU.roundingError > _loc3_.y + _loc3_.height)
               {
                  _loc4_ = _loc4_.next;
               }
               else
               {
                  if(_oc == null)
                  {
                     _o.kill();
                     _loc3_.kill();
                     _loc2_ = true;
                  }
                  else if(_oc(_o,_loc3_))
                  {
                     _loc2_ = true;
                  }
                  _loc4_ = _loc4_.next;
               }
            }
         }
         return _loc2_;
      }
   }
}

