package org.flixel
{
   public class FlxMonitor
   {
      
      protected var _size:uint;
      
      protected var _itr:uint;
      
      protected var _data:Array;
      
      public function FlxMonitor(param1:uint, param2:Number = 0)
      {
         super();
         this._size = param1;
         if(this._size <= 0)
         {
            this._size = 1;
         }
         this._itr = 0;
         this._data = new Array(this._size);
         var _loc3_:uint = 0;
         while(_loc3_ < this._size)
         {
            this._data[_loc3_] = param2;
            _loc3_++;
         }
      }
      
      public function add(param1:Number) : void
      {
         §§push(this._data);
         var _loc3_:FlxMonitor;
         var _temp_2:* = (_loc3_ = this)._itr;
         var _loc4_:Number = _temp_2 + 1;
         _loc3_._itr = _loc4_;
         var _loc2_:Number = _temp_2;
         §§pop()[_loc2_] = param1;
         if(this._itr >= this._size)
         {
            this._itr = 0;
         }
      }
      
      public function average() : Number
      {
         var _loc1_:Number = 0;
         var _loc2_:uint = 0;
         while(_loc2_ < this._size)
         {
            _loc1_ += this._data[_loc2_];
            _loc2_++;
         }
         return _loc1_ / this._size;
      }
   }
}

