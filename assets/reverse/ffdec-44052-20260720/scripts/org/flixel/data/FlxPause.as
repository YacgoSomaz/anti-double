package org.flixel.data
{
   import org.flixel.FlxButton;
   import org.flixel.FlxG;
   import org.flixel.FlxGroup;
   import org.flixel.FlxSprite;
   
   public class FlxPause extends FlxGroup
   {
      
      public static var _bMenu:FlxButton;
      
      public static var _bResume:FlxButton;
      
      public static var pauseBg:FlxSprite;
      
      private var ImgResumeButton:Class = FlxPause_ImgResumeButton;
      
      private var ImgResumeButtonOver:Class = FlxPause_ImgResumeButtonOver;
      
      private var ImgMenuButton:Class = FlxPause_ImgMenuButton;
      
      private var ImgMenuButtonOver:Class = FlxPause_ImgMenuButtonOver;
      
      private var ImgPauseBackground:Class = FlxPause_ImgPauseBackground;
      
      public var menuCountdown:Number = 0;
      
      public function FlxPause()
      {
         super();
         scrollFactor.x = 0;
         scrollFactor.y = 0;
         var _loc1_:uint = 80;
         var _loc2_:uint = 92;
         _bMenu = new FlxButton(180,248,this.onMenu);
         _bMenu.loadGraphic(new FlxSprite(0,0,this.ImgMenuButton),new FlxSprite(0,0,this.ImgMenuButtonOver));
         _bMenu.scrollFactor.x = 0;
         _bMenu.scrollFactor.y = 0;
         _bResume = new FlxButton(173,160,this.onResume);
         _bResume.loadGraphic(new FlxSprite(0,0,this.ImgResumeButton),new FlxSprite(0,0,this.ImgResumeButtonOver));
         _bResume.scrollFactor.x = 0;
         _bResume.scrollFactor.y = 0;
         pauseBg = new FlxSprite(0,0,this.ImgPauseBackground);
         pauseBg.scrollFactor.x = 0;
         pauseBg.scrollFactor.y = 0;
         pauseBg.visible = false;
         add(pauseBg);
         add(_bMenu);
         add(_bResume);
      }
      
      protected function onMenu() : void
      {
         this.menuCountdown = 0.5;
         _bMenu.active = false;
         _bResume.active = false;
         this.goToMenu();
      }
      
      protected function goToMenu() : void
      {
         FlxG.goToMenu = true;
         FlxG.pause = false;
         _bMenu.active = false;
         _bResume.active = false;
         pauseBg.visible = false;
      }
      
      protected function onResume() : void
      {
         FlxG.pause = false;
         _bMenu.active = false;
         _bResume.active = false;
         _bMenu.visible = false;
         _bResume.visible = false;
         pauseBg.visible = false;
      }
      
      override public function update() : void
      {
         saveOldPosition();
         updateMotion();
         updateMembers();
         updateFlickering();
         _bMenu.active = true;
         _bResume.active = true;
         pauseBg.visible = true;
         if(FlxG.keys.justPressed("P") && FlxG.pause && FlxG.numPlayers < 4)
         {
            this.onResume();
         }
      }
   }
}

