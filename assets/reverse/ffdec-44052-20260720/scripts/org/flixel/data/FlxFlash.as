package org.flixel.data
{
   import org.flixel.FlxG;
   import org.flixel.FlxSprite;
   
   public class FlxFlash extends FlxSprite
   {
      
      protected var _delay:Number;
      
      protected var _complete:Function;
      
      public function FlxFlash()
      {
         super();
         createGraphic(FlxG.width,FlxG.height,0,true);
         scrollFactor.x = 0;
         scrollFactor.y = 0;
         exists = false;
         solid = false;
         fixed = true;
      }
      
      public function start(param1:uint = 4294967295, param2:Number = 1, param3:Function = null, param4:Boolean = false) : void
      {
         if(!param4 && exists)
         {
            return;
         }
         fill(param1);
         this._delay = param2;
         this._complete = param3;
         alpha = 1;
         exists = true;
      }
      
      public function stop() : void
      {
         exists = false;
      }
      
      override public function update() : void
      {
         alpha -= FlxG.elapsed / this._delay;
         if(alpha <= 0)
         {
            exists = false;
            if(this._complete != null)
            {
               this._complete();
            }
         }
      }
   }
}

