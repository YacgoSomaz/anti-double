package com.miniclip.GSwitch
{
   import org.flixel.FlxObject;
   
   public class OverlapArea extends FlxObject
   {
      
      public var type:uint;
      
      public var num:Number;
      
      public var auxInt:int;
      
      public function OverlapArea(param1:Number = 0, param2:Number = 0, param3:Number = 0, param4:Number = 0, param5:uint = 0, param6:Number = 0)
      {
         super(param1,param2,param3,param4);
         this.type = param5;
         this.num = param6;
      }
   }
}

