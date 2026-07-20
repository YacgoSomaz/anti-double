package org.flixel
{
   import flash.display.Sprite;
   
   public class FlxState extends Sprite
   {
      
      public static var screen:FlxSprite;
      
      public static var bgColor:uint;
      
      public var defaultGroup:FlxGroup;
      
      public function FlxState()
      {
         super();
         this.defaultGroup = new FlxGroup();
         if(screen == null)
         {
            screen = new FlxSprite();
            screen.createGraphic(FlxG.width,FlxG.height,0,true);
            screen.origin.x = screen.origin.y = 0;
            screen.antialiasing = true;
            screen.exists = false;
            screen.solid = false;
            screen.fixed = true;
         }
      }
      
      public function create() : void
      {
      }
      
      public function add(param1:FlxObject) : FlxObject
      {
         return this.defaultGroup.add(param1);
      }
      
      public function preProcess() : void
      {
         screen.fill(bgColor);
      }
      
      public function update() : void
      {
         this.defaultGroup.update();
      }
      
      public function collide() : void
      {
         FlxU.collide(this.defaultGroup,this.defaultGroup);
      }
      
      public function render() : void
      {
         this.defaultGroup.render();
      }
      
      public function postProcess() : void
      {
      }
      
      public function destroy() : void
      {
         this.defaultGroup.destroy();
      }
   }
}

