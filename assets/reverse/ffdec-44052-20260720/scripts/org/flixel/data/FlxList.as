package org.flixel.data
{
   import org.flixel.FlxObject;
   
   public class FlxList
   {
      
      public var object:FlxObject;
      
      public var next:FlxList;
      
      public function FlxList()
      {
         super();
         this.object = null;
         this.next = null;
      }
   }
}

