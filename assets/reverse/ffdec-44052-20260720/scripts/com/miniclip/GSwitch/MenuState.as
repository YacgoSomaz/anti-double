package com.miniclip.GSwitch
{
   import flash.display.Loader;
   import flash.events.Event;
   import flash.net.URLRequest;
   import flash.system.Security;
   import org.flixel.*;
   
   public class MenuState extends FlxState
   {
      
      public static var ImgLoadingSplash:Class = MenuState_ImgLoadingSplash;
      
      private var ImgIntersticialBG:Class = MenuState_ImgIntersticialBG;
      
      private var ImgMiniclip:Class = MenuState_ImgMiniclip;
      
      private var ImgMiniclipHL:Class = MenuState_ImgMiniclipHL;
      
      private var ImgSoundButOn:Class = MenuState_ImgSoundButOn;
      
      private var ImgSoundButOnHL:Class = MenuState_ImgSoundButOnHL;
      
      private var ImgSoundBut:Class = MenuState_ImgSoundBut;
      
      private var ImgSoundButHL:Class = MenuState_ImgSoundButHL;
      
      private var ImgCoverup:Class = MenuState_ImgCoverup;
      
      private var ImgLeftGuy:Class = MenuState_ImgLeftGuy;
      
      private var ImgRightGuy:Class = MenuState_ImgRightGuy;
      
      private var ImgContinueGame:Class = MenuState_ImgContinueGame;
      
      private var ImgYes:Class = MenuState_ImgYes;
      
      private var ImgYesOver:Class = MenuState_ImgYesOver;
      
      private var ImgNo:Class = MenuState_ImgNo;
      
      private var ImgNoOver:Class = MenuState_ImgNoOver;
      
      private var ImgMenuBackground:Class = MenuState_ImgMenuBackground;
      
      private var ImgPlayButton:Class = MenuState_ImgPlayButton;
      
      private var ImgPlayButtonOver:Class = MenuState_ImgPlayButtonOver;
      
      private var ImgMultiButton:Class = MenuState_ImgMultiButton;
      
      private var ImgMultiButtonOver:Class = MenuState_ImgMultiButtonOver;
      
      private var ImgScoreButton:Class = MenuState_ImgScoreButton;
      
      private var ImgScoreButtonOver:Class = MenuState_ImgScoreButtonOver;
      
      private var ImgCreditsButton:Class = MenuState_ImgCreditsButton;
      
      private var ImgCreditsButtonOver:Class = MenuState_ImgCreditsButtonOver;
      
      private var ImgMultiButton2:Class = MenuState_ImgMultiButton2;
      
      private var ImgMultiButtonOver2:Class = MenuState_ImgMultiButtonOver2;
      
      private var ImgMultiButton3:Class = MenuState_ImgMultiButton3;
      
      private var ImgMultiButtonOver3:Class = MenuState_ImgMultiButtonOver3;
      
      private var ImgMultiButton4:Class = MenuState_ImgMultiButton4;
      
      private var ImgMultiButtonOver4:Class = MenuState_ImgMultiButtonOver4;
      
      private var ImgBackButton:Class = MenuState_ImgBackButton;
      
      private var ImgBackButtonOver:Class = MenuState_ImgBackButtonOver;
      
      private var ImgLogoHL:Class = MenuState_ImgLogoHL;
      
      private var ImgChooseNumberOfPlayers:Class = MenuState_ImgChooseNumberOfPlayers;
      
      private var ImgCursor:Class = MenuState_ImgCursor;
      
      private var SndHit2:Class = MenuState_SndHit2;
      
      private var devKey:String = "6904f3ed897cc503503ef6d3437c9d00";
      
      private var gameKey:String = "gravity-guy";
      
      private var _submittedScore:Boolean;
      
      private var _leftGuy:FlxSprite;
      
      private var _rightGuy:FlxSprite;
      
      private var _guysClosing:Boolean = false;
      
      private var _guysOpening:Boolean = false;
      
      private var _b:FlxButton;
      
      private var _bMulti:FlxButton;
      
      private var _bMulti2:FlxButton;
      
      private var _bMulti3:FlxButton;
      
      private var _bMulti4:FlxButton;
      
      private var _bBack:FlxButton;
      
      private var _bScores:FlxButton;
      
      private var _bCredits:FlxButton;
      
      private var _bMiniclip:FlxButton;
      
      private var _bSound:FlxButton;
      
      private var chooseNumberOfPlayers:FlxSprite;
      
      private var logoHL:FlxSprite;
      
      private var activateMenuButtons:uint = 0;
      
      private var activateMultiButtons:uint = 0;
      
      private var coverup:FlxSprite;
      
      private var _loadingScores:FlxText;
      
      private var _t1:FlxText;
      
      private var _t2:FlxText;
      
      private var _ok:Boolean;
      
      private var _ok2:Boolean;
      
      private var yes:FlxButton;
      
      private var no:FlxButton;
      
      private var highlightIncreasing:Boolean = true;
      
      private var countDown:Number = 999;
      
      private var dontCountDownYet:Boolean = false;
      
      private var showIntersticial:Boolean = false;
      
      private var _intersticialBG:FlxSprite;
      
      private var _intersticialContinue:FlxButton;
      
      private var _getItNow:FlxButton;
      
      private var _getItNowHL:FlxSprite;
      
      private var flashButton:Number = 0;
      
      private var _screenshot2:FlxSprite;
      
      private var _screenshot3:FlxSprite;
      
      protected var _screenshotChangeTime:Number = 1;
      
      public function MenuState()
      {
         super();
      }
      
      override public function create() : void
      {
         var _loc1_:uint = 0;
         var _loc2_:FlxSprite = null;
         FlxG.inPlayState = false;
         PlayState.checkpointSave = new FlxSave();
         this.showIntersticial = false;
         FlxG.timeScale = 1;
         FlxG.credits = false;
         FlxG.round = 0;
         PlayState.p1wins = 0;
         PlayState.p2wins = 0;
         PlayState.p3wins = 0;
         PlayState.p4wins = 0;
         FlxG.volume = 0.6;
         FlxG.playMusic(SndMenuMusic,0.9);
         this._ok = false;
         this._ok2 = false;
         this.chooseNumberOfPlayers = new FlxSprite(168,220,this.ImgChooseNumberOfPlayers);
         this.chooseNumberOfPlayers.visible = false;
         this.logoHL = new FlxSprite(232,15 + 38,this.ImgLogoHL);
         this.logoHL.alpha = 0;
         add(new FlxSprite(0,6,this.ImgMenuBackground) as FlxSprite);
         this._leftGuy = new FlxSprite(-200 - 50,127,this.ImgLeftGuy);
         add(this._leftGuy);
         this._rightGuy = new FlxSprite(FlxG.width + 5 + 14 + 50,139,this.ImgRightGuy);
         add(this._rightGuy);
         this._b = new FlxButton(194,224,this.onPlay);
         this._b.loadGraphic(new FlxSprite(0,0,this.ImgPlayButton),new FlxSprite(0,0,this.ImgPlayButtonOver));
         add(this._b);
         this._bMulti = new FlxButton(204,332,this.onPlayMulti);
         this._bMulti.loadGraphic(new FlxSprite(0,0,this.ImgMultiButton),new FlxSprite(0,0,this.ImgMultiButtonOver));
         add(this._bMulti);
         this._bMulti2 = new FlxButton(117,288,this.onPlayMulti2);
         this._bMulti2.loadGraphic(new FlxSprite(0,0,this.ImgMultiButton2),new FlxSprite(0,0,this.ImgMultiButtonOver2));
         this._bMulti2.exists = false;
         this._bMulti2.visible = false;
         add(this._bMulti2);
         this._bMulti3 = new FlxButton(257,288,this.onPlayMulti3);
         this._bMulti3.loadGraphic(new FlxSprite(0,0,this.ImgMultiButton3),new FlxSprite(0,0,this.ImgMultiButtonOver3));
         this._bMulti3.exists = false;
         this._bMulti3.visible = false;
         add(this._bMulti3);
         this._bMulti4 = new FlxButton(391,288,this.onPlayMulti4);
         this._bMulti4.loadGraphic(new FlxSprite(0,0,this.ImgMultiButton4),new FlxSprite(0,0,this.ImgMultiButtonOver4));
         this._bMulti4.exists = false;
         this._bMulti4.visible = false;
         add(this._bMulti4);
         this._bBack = new FlxButton(238,415,this.onBack);
         this._bBack.loadGraphic(new FlxSprite(0,0,this.ImgBackButton),new FlxSprite(0,0,this.ImgBackButtonOver));
         this._bBack.exists = false;
         this._bBack.visible = false;
         add(this._bBack);
         this._bScores = new FlxButton(345,422,this.onScores);
         this._bScores.loadGraphic(new FlxSprite(0,0,this.ImgScoreButton),new FlxSprite(0,0,this.ImgScoreButtonOver));
         add(this._bScores);
         this._bCredits = new FlxButton(148,422,this.onCredits);
         this._bCredits.loadGraphic(new FlxSprite(0,0,this.ImgCreditsButton),new FlxSprite(0,0,this.ImgCreditsButtonOver));
         add(this._bCredits);
         this._bMiniclip = new FlxButton(171,-18,this.onMiniclip);
         this._bMiniclip.loadGraphic(new FlxSprite(0,0,this.ImgMiniclip),new FlxSprite(0,0,this.ImgMiniclipHL));
         this._bMiniclip.scrollFactor.x = 0;
         this._bMiniclip.scrollFactor.y = 0;
         add(this._bMiniclip);
         add(this.chooseNumberOfPlayers);
         add(this.logoHL);
         this._bSound = new FlxButton(0,0,this.onSound);
         this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundButOn),new FlxSprite(0,0,this.ImgSoundButOnHL));
         this._bSound.scrollFactor.x = 0;
         this._bSound.scrollFactor.y = 0;
         if(FlxG.mute)
         {
            this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundBut),new FlxSprite(0,0,this.ImgSoundButHL));
         }
         add(this._bSound);
         this._loadingScores = new FlxText(0,FlxG.height * 0.924,FlxG.width,"Submitting Score...");
         this._loadingScores.setFormat("ethno",22,16777215,"center");
         this._loadingScores.visible = false;
         add(this._loadingScores);
         this._intersticialBG = new FlxSprite(0,0,this.ImgIntersticialBG);
         this._intersticialBG.visible = false;
         add(this._intersticialBG);
         this._intersticialContinue = new FlxButton(208,397,this.OnIntersticialContinue);
         this._intersticialContinue.loadGraphic(new FlxSprite(-5,0,PlayState.ImgContinueInt),new FlxSprite(-5,0,PlayState.ImgContinueIntOver));
         this._intersticialContinue.visible = false;
         this._intersticialContinue.active = false;
         add(this._intersticialContinue);
         this._getItNow = new FlxButton(170,273,this.onGetIt);
         this._getItNow.loadGraphic(new FlxSprite(0,0,PlayState.ImgGetItNowOff),new FlxSprite(0,0,PlayState.ImgGetItNowOn));
         this._getItNow.visible = false;
         this._getItNow.active = false;
         add(this._getItNow);
         this._getItNowHL = new FlxSprite(170,273,PlayState.ImgGetItNowOn);
         this._getItNowHL.visible = false;
         add(this._getItNowHL);
         this._screenshot2 = new FlxSprite(219,19,PlayState.ImgScreenshot2);
         this._screenshot2.visible = false;
         add(this._screenshot2);
         this._screenshot3 = new FlxSprite(219,19,PlayState.ImgScreenshot3);
         this._screenshot3.visible = false;
         add(this._screenshot3);
         add(this.coverup = new FlxSprite(0,0,this.ImgCoverup));
         FlxG.flash.start(4278190080,1.2);
         var _loc3_:String = "http://agi.armorgames.com/assets/agi/AGI.swf";
         Security.allowDomain(_loc3_);
         var _loc4_:URLRequest = new URLRequest(_loc3_);
         var _loc5_:Loader = new Loader();
         _loc5_.contentLoaderInfo.addEventListener(Event.COMPLETE,this.loadComplete);
         _loc5_.load(_loc4_);
      }
      
      override public function update() : void
      {
         if(!FlxG.start)
         {
            return;
         }
         if(this.coverup.visible == true)
         {
            this._guysClosing = true;
         }
         this.coverup.visible = false;
         if(this._guysClosing)
         {
            if(this._leftGuy.x < -229 || this._leftGuy.velocity.x < 261 && this._leftGuy.velocity.x > 0)
            {
               this._leftGuy.velocity.x = 250;
               this._rightGuy.velocity.x = -250;
            }
            else
            {
               this._leftGuy.velocity.x = 530;
               this._rightGuy.velocity.x = -530;
            }
            if(this._leftGuy.x > 0)
            {
               this._leftGuy.x = 0;
               this._rightGuy.x = 459;
               if(this._leftGuy.velocity.x < 261)
               {
                  FlxG.flash.stop();
                  FlxG.quake.start(0.01,0.2);
                  FlxG.flash.start(3724541951,0.8);
               }
               this._leftGuy.velocity.x = 0;
               this._rightGuy.velocity.x = 0;
               this._guysClosing = false;
            }
         }
         if(this._guysOpening)
         {
            this._leftGuy.velocity.x = -530;
            this._rightGuy.velocity.x = 530;
            if(this._leftGuy.x < -200)
            {
               this._leftGuy.x = -200;
               this._rightGuy.x = FlxG.width + 5 + 14;
               this._leftGuy.velocity.x = 0;
               this._rightGuy.velocity.x = 0;
               this._guysOpening = false;
            }
         }
         if(this.showIntersticial)
         {
            this._bSound.active = false;
            this._screenshotChangeTime -= FlxG.elapsed;
            if(this._screenshotChangeTime <= 0)
            {
               this._screenshotChangeTime = 1;
               if(this._screenshot2.visible)
               {
                  this._screenshot2.visible = false;
                  this._screenshot3.visible = true;
               }
               else if(this._screenshot3.visible)
               {
                  this._screenshot3.visible = false;
               }
               else
               {
                  this._screenshot2.visible = true;
               }
            }
            this._intersticialBG.visible = true;
            this._intersticialContinue.visible = true;
            this._intersticialContinue.active = true;
            this._getItNow.visible = true;
            this._getItNow.active = true;
            if(this.flashButton < 50)
            {
               this.flashButton -= FlxG.elapsed;
            }
            else if(this.flashButton > 50)
            {
               this.flashButton += FlxG.elapsed;
            }
            if(this.flashButton <= 0)
            {
               this.flashButton = 100;
               this._getItNowHL.visible = true;
            }
            if(this.flashButton >= 100.4)
            {
               this.flashButton = 0.4;
               this._getItNowHL.visible = false;
            }
            if(FlxG.keys.justPressed("SPACE"))
            {
               this.OnIntersticialContinue();
            }
            super.update();
            return;
         }
         if(this.dontCountDownYet)
         {
            super.update();
            this.yes.visible = true;
            this.no.visible = true;
            this._bSound.active = false;
            if(FlxG.keys.justPressed("SPACE"))
            {
               this.onYes();
            }
            return;
         }
         if(this.countDown < 999)
         {
            this.countDown -= FlxG.elapsed;
            if(this.countDown <= 0)
            {
               FlxG.state = new PlayState();
               return;
            }
         }
         if(this.highlightIncreasing)
         {
            this.logoHL.alpha += FlxG.elapsed * 0.8;
            if(this.logoHL.alpha >= 1)
            {
               this.logoHL.alpha = 1;
               this.highlightIncreasing = false;
            }
         }
         else
         {
            this.logoHL.alpha -= FlxG.elapsed * 0.8;
            if(this.logoHL.alpha <= 0)
            {
               this.logoHL.alpha = 0;
               this.highlightIncreasing = true;
            }
         }
         this._ok = true;
         if(FlxG.keys.justPressed("SPACE"))
         {
            if(this._bMulti.exists)
            {
               this.onPlay();
            }
         }
         if(this.activateMenuButtons > 0)
         {
            --this.activateMenuButtons;
         }
         if(this.activateMenuButtons == 1)
         {
            this._bMulti.exists = true;
            this._bMulti.visible = true;
            this._b.exists = true;
            this._b.visible = true;
            this._bScores.exists = true;
            this._bScores.visible = true;
            this._bCredits.exists = true;
            this._bCredits.visible = true;
            this._bMulti2.exists = false;
            this._bMulti2.visible = false;
            this._bMulti3.exists = false;
            this._bMulti3.visible = false;
            this._bMulti3.active = false;
            this._bMulti4.exists = false;
            this._bMulti4.visible = false;
            this._bBack.exists = false;
            this._bBack.visible = false;
            this.chooseNumberOfPlayers.visible = false;
         }
         if(this.activateMultiButtons > 0)
         {
            --this.activateMultiButtons;
         }
         if(this.activateMultiButtons == 1)
         {
            this._bMulti.exists = false;
            this._bMulti.visible = false;
            this._b.exists = false;
            this._b.visible = false;
            this._bScores.exists = false;
            this._bScores.visible = false;
            this._bCredits.exists = false;
            this._bCredits.visible = false;
            this._bMulti2.exists = true;
            this._bMulti2.visible = true;
            this._bMulti3.exists = true;
            this._bMulti3.visible = true;
            this._bMulti3.active = true;
            this._bMulti4.exists = true;
            this._bMulti4.visible = true;
            this._bBack.exists = true;
            this._bBack.visible = true;
            this.chooseNumberOfPlayers.visible = true;
         }
         if(this._ok && !this._ok2 && FlxG.keys.X && FlxG.keys.C)
         {
            this._ok2 = true;
            FlxG.flash.start(4293848814,0.5);
            FlxG.fade.start(4278190080,1,this.onFade);
         }
         if(this._b.hovered && this._bMulti.hovered)
         {
            this._b.visibility(false);
         }
         super.update();
      }
      
      private function onFlixel() : void
      {
         FlxU.openURL("http://flixel.org");
      }
      
      private function onPlay() : void
      {
         FlxG.miniclipTrack.loadPlay();
         this._b.active = false;
         this._bMulti.active = false;
         this._bCredits.active = false;
         this._bScores.active = false;
         this._bSound.active = false;
         this._ok2 = true;
         FlxG.numPlayers = 1;
         FlxG.flash.start(4293848814,0.5);
         this.showIntersticial = true;
         this._guysOpening = true;
         this._guysClosing = false;
      }
      
      private function onScores() : void
      {
         this._b.visible = false;
         this._b.active = false;
         this._bCredits.visible = false;
         this._bCredits.active = false;
         this._bMulti.visible = false;
         this._bMulti.active = false;
         this._bScores.visible = false;
         this._bScores.active = false;
         this._bMiniclip.active = false;
         FlxG.agi.showScoreboardList();
         FlxG.agi.initAGUI({"onClose":this.handleAGUIClose});
         this._guysOpening = true;
         this._guysClosing = false;
      }
      
      private function onCredits() : void
      {
         FlxG.credits = true;
         this._b.active = false;
         this._ok2 = true;
         FlxG.numPlayers = 1;
         FlxG.flash.start(4293848814,0.5);
         FlxG.fade.start(4278190080,1,this.onFade);
         this._bMulti.active = false;
         this._bCredits.active = false;
         this._bScores.active = false;
         this._bSound.active = false;
         this._guysOpening = true;
         this._guysClosing = false;
      }
      
      private function onPlayMulti() : void
      {
         FlxG.miniclipTrack.loadMulti();
         FlxG.numPlayers = 2;
         this.activateMultiButtons = 3;
         FlxG.flash.start(4293848814,0.5);
         this._guysOpening = true;
         this._guysClosing = false;
      }
      
      private function onBack() : void
      {
         FlxG.numPlayers = 1;
         this.activateMenuButtons = 3;
         this._guysClosing = true;
         this._guysOpening = false;
         this._ok2 = true;
         FlxG.flash.start(4293848814,0.5);
      }
      
      private function OnIntersticialContinue() : void
      {
         this.showIntersticial = false;
         this._intersticialBG.visible = false;
         this._intersticialContinue.visible = false;
         this._intersticialContinue.active = false;
         this._getItNow.visible = false;
         this._getItNow.active = false;
         this._getItNowHL.visible = false;
         this._screenshot2.visible = false;
         this._screenshot3.visible = false;
         FlxG.fade.start(4278190080,1,this.onFade);
      }
      
      private function onGetIt() : void
      {
         FlxG.miniclipTrack.loadITunes();
         FlxU.openURL("http://www.miniclip.com/iphone/appstore.php?name=gravity-guy&id=398348506");
      }
      
      private function onPlayMulti2() : void
      {
         FlxG.numPlayers = 2;
         this._bMulti.active = false;
         this._ok2 = true;
         this._bBack.active = false;
         this._bMulti2.active = false;
         this._bMulti3.active = false;
         this._bMulti4.active = false;
         FlxG.flash.start(4293848814,0.5);
         this.showIntersticial = true;
      }
      
      private function onPlayMulti3() : void
      {
         FlxG.numPlayers = 3;
         this._bMulti.active = false;
         this._ok2 = true;
         this._bBack.active = false;
         this._bMulti2.active = false;
         this._bMulti3.active = false;
         this._bMulti4.active = false;
         FlxG.flash.start(4293848814,0.5);
         this.showIntersticial = true;
      }
      
      private function onPlayMulti4() : void
      {
         FlxG.numPlayers = 4;
         this._bMulti.active = false;
         this._ok2 = true;
         this._bBack.active = false;
         this._bMulti2.active = false;
         this._bMulti3.active = false;
         this._bMulti4.active = false;
         FlxG.flash.start(4293848814,0.5);
         this.showIntersticial = true;
      }
      
      private function onFade() : void
      {
         if(FlxG.numPlayers == 1)
         {
            if(PlayState.checkpointSave.bind("flixel") && PlayState.checkpointSave.data.checkpointX != null && PlayState.checkpointSave.data.checkpointX > 1800 && !FlxG.credits)
            {
               FlxG.play(SndPopupAppear);
               add(new FlxSprite(0,0,this.ImgContinueGame));
               this.yes = new FlxButton(34 + 138,140 + 124,this.onYes);
               this.no = new FlxButton(204 + 138,140 + 124,this.onNo);
               this.yes.loadGraphic(new FlxSprite(0,0,this.ImgYes),new FlxSprite(0,0,this.ImgYesOver));
               this.no.loadGraphic(new FlxSprite(0,0,this.ImgNo),new FlxSprite(0,0,this.ImgNoOver));
               this.yes.visible = false;
               this.no.visible = false;
               add(this.yes);
               add(this.no);
               this.dontCountDownYet = true;
               this._b.active = false;
               this._bMulti.active = false;
               this._bScores.active = false;
               this._bCredits.active = false;
               FlxG.fade.stop();
            }
         }
         if(this.dontCountDownYet)
         {
            return;
         }
         this.countDown = 0.075;
         FlxG.fade.stop();
         add(new FlxSprite(0,0,ImgLoadingSplash));
      }
      
      private function onYes() : void
      {
         FlxG.play(SndPopupDisappear);
         this.dontCountDownYet = false;
         FlxG.fade.start(4278190080,0.3,this.onFade2);
      }
      
      private function onNo() : void
      {
         FlxG.play(SndPopupDisappear);
         FlxG.fade.stop();
         this.dontCountDownYet = false;
         if(PlayState.checkpointSave.bind("flixel"))
         {
            PlayState.checkpointSave.erase();
            FlxG.checkpointX = 299;
            FlxG.checkpointY = 270;
            FlxG.score = 0;
         }
         FlxG.fade.start(4278190080,0.3,this.onFade2);
      }
      
      private function onFade2() : void
      {
         FlxG.fade.stop();
         this.countDown = 0.075;
         add(new FlxSprite(0,0,ImgLoadingSplash));
      }
      
      protected function onSound() : void
      {
         if(!FlxG.mute)
         {
            FlxG.mute = true;
            this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundBut),new FlxSprite(0,0,this.ImgSoundButHL));
         }
         else
         {
            FlxG.mute = false;
            this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundButOn),new FlxSprite(0,0,this.ImgSoundButOnHL));
         }
         this._bSound.x = 0;
      }
      
      protected function onMiniclip() : void
      {
         FlxU.openURL("http://www.armorgames.com");
      }
      
      protected function handleAGUIClose() : void
      {
         this._submittedScore = true;
         this._b.visible = true;
         this._b.active = true;
         this._bCredits.visible = true;
         this._bCredits.active = true;
         this._bMulti.visible = true;
         this._bMulti.active = true;
         this._bScores.visible = true;
         this._bScores.active = true;
         this._loadingScores.visible = false;
         this._guysOpening = false;
         this._guysClosing = true;
         this._bMiniclip.active = true;
      }
      
      public function loadComplete(param1:Event) : void
      {
         FlxG.loadedAPI = true;
         FlxG.agi = param1.currentTarget.content;
         addChild(FlxG.agi);
         FlxG.agi.init(this.devKey,this.gameKey);
         FlxG.agi.initAGUI();
      }
   }
}

