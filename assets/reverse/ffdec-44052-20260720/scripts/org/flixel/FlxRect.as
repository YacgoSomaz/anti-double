package org.flixel
{
   public class FlxRect extends FlxPoint
   {
      
      public var width:Number;
      
      public var height:Number;
      
      public function FlxRect(param1:Number = 0, param2:Number = 0, param3:Number = 0, param4:Number = 0)
      {
         super(param1,param2);
         this.width = param3;
         this.height = param4;
      }
      
      public function get left() : Number
      {
         return x;
      }
      
      public function get right() : Number
      {
         return x + this.width;
      }
      
      public function get top() : Number
      {
         return y;
      }
      
      public function get bottom() : Number
      {
         return y + this.height;
      }
   }
}

