package org.flixel.data
{
   import flash.events.MouseEvent;
   import org.flixel.FlxSprite;
   import org.flixel.FlxU;
   
   public class FlxMouse
   {
      
      protected var ImgDefaultCursor:Class = FlxMouse_ImgDefaultCursor;
      
      public var x:int;
      
      public var y:int;
      
      public var screenX:int;
      
      public var screenY:int;
      
      public var cursor:FlxSprite;
      
      protected var _current:int;
      
      protected var _last:int;
      
      protected var _out:Boolean;
      
      public function FlxMouse()
      {
         super();
         this.x = 0;
         this.y = 0;
         this.screenX = 0;
         this.screenY = 0;
         this._current = 0;
         this._last = 0;
         this.cursor = null;
         this._out = false;
      }
      
      public function show(param1:Class = null, param2:int = 0, param3:int = 0) : void
      {
         this._out = true;
         if(param1 != null)
         {
            this.load(param1,param2,param3);
         }
         else if(this.cursor != null)
         {
            this.cursor.visible = true;
         }
         else
         {
            this.load(null);
         }
      }
      
      public function hide() : void
      {
         if(this.cursor != null)
         {
            this.cursor.visible = false;
            this._out = false;
         }
      }
      
      public function load(param1:Class, param2:int = 0, param3:int = 0) : void
      {
         if(param1 == null)
         {
            param1 = this.ImgDefaultCursor;
         }
         this.cursor = new FlxSprite(this.screenX,this.screenY,param1);
         this.cursor.offset.x = param2;
         this.cursor.offset.y = param3;
      }
      
      public function unload() : void
      {
         if(this.cursor != null)
         {
            if(this.cursor.visible)
            {
               this.load(null);
            }
            else
            {
               this.cursor = null;
            }
         }
      }
      
      public function update(param1:int, param2:int, param3:Number, param4:Number) : void
      {
         this.screenX = param1;
         this.screenY = param2;
         this.x = this.screenX - FlxU.floor(param3);
         this.y = this.screenY - FlxU.floor(param4);
         if(this.cursor != null)
         {
            this.cursor.x = this.x;
            this.cursor.y = this.y;
         }
         if(this._last == -1 && this._current == -1)
         {
            this._current = 0;
         }
         else if(this._last == 2 && this._current == 2)
         {
            this._current = 1;
         }
         this._last = this._current;
      }
      
      public function reset() : void
      {
         this._current = 0;
         this._last = 0;
      }
      
      public function pressed() : Boolean
      {
         return this._current > 0;
      }
      
      public function justPressed() : Boolean
      {
         return this._current == 2;
      }
      
      public function justReleased() : Boolean
      {
         return this._current == -1;
      }
      
      public function handleMouseDown(param1:MouseEvent) : void
      {
         if(this._current > 0)
         {
            this._current = 1;
         }
         else
         {
            this._current = 2;
         }
      }
      
      public function handleMouseUp(param1:MouseEvent) : void
      {
         if(this._current > 0)
         {
            this._current = -1;
         }
         else
         {
            this._current = 0;
         }
      }
      
      public function handleMouseOut(param1:MouseEvent) : void
      {
         if(this.cursor != null)
         {
            this._out = this.cursor.visible;
            this.cursor.visible = false;
         }
      }
      
      public function handleMouseOver(param1:MouseEvent) : void
      {
         if(this.cursor != null)
         {
            this.cursor.visible = this._out;
         }
      }
   }
}

