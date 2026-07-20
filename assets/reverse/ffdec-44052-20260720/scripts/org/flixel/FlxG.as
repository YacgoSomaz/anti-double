package org.flixel
{
   import flash.display.BitmapData;
   import flash.display.Stage;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import org.flixel.data.*;
   
   public class FlxG
   {
      
      public static var root:*;
      
      public static var agi:*;
      
      public static var enemySwitch:Array;
      
      public static var enemySpawnX:uint;
      
      public static var enemySpawnY:uint;
      
      public static var enemySpawnSpeed:Number;
      
      protected static var _game:FlxGame;
      
      protected static var _pause:Boolean;
      
      public static var debug:Boolean;
      
      protected static var _showBounds:Boolean;
      
      public static var elapsed:Number;
      
      public static var maxElapsed:Number;
      
      public static var timeScale:Number;
      
      public static var width:uint;
      
      public static var height:uint;
      
      public static var levels:Array;
      
      public static var level:int;
      
      public static var scores:Array;
      
      public static var score:int;
      
      public static var saves:Array;
      
      public static var save:int;
      
      public static var mouse:FlxMouse;
      
      public static var keys:FlxKeyboard;
      
      public static var music:FlxSound;
      
      public static var sounds:Array;
      
      protected static var _mute:Boolean;
      
      protected static var _volume:Number;
      
      public static var followTarget:FlxObject;
      
      public static var followLead:Point;
      
      public static var followLerp:Number;
      
      public static var followMin:Point;
      
      public static var followMax:Point;
      
      protected static var _scrollTarget:Point;
      
      public static var scroll:Point;
      
      public static var buffer:BitmapData;
      
      protected static var _cache:Object;
      
      public static var kong:FlxKong;
      
      public static var panel:FlxPanel;
      
      public static var quake:FlxQuake;
      
      public static var flash:FlxFlash;
      
      public static var fade:FlxFade;
      
      public static var miniclipTrack:Tracker = new Tracker();
      
      public static var prePlay:Boolean = false;
      
      public static var percentageLoaded:int = 0;
      
      public static var waitingForLoad:Boolean = false;
      
      public static var loadedAPI:Boolean = false;
      
      public static var start:Boolean = false;
      
      public static var inPlayState:Boolean = false;
      
      public static var lastRealCheckpointScore:int = 0;
      
      public static var maxScore:int = 0;
      
      public static var submittingScore:Boolean = false;
      
      public static var ending:Number = -1;
      
      public static var credits:Boolean = false;
      
      public static var useCam:Boolean = true;
      
      public static var tutorial:Boolean = false;
      
      public static var showIntersticial:Boolean = false;
      
      public static var numDeaths:uint = 0;
      
      public static var numPlayers:int = 1;
      
      public static var endless:Boolean = false;
      
      public static var goToMenu:Boolean = false;
      
      public static var round:int = 0;
      
      public static var timeToReload:Number = 999;
      
      public static var currentCheckpoint:uint = 0;
      
      public static var checkpointX:uint = 299;
      
      public static var checkpointY:uint = 270;
      
      public static var enemySpawnFacing:uint = 1;
      
      public static var cameraX:Number = 299;
      
      public static var LIBRARY_NAME:String = "flixel";
      
      public static var LIBRARY_MAJOR_VERSION:uint = 2;
      
      public static var LIBRARY_MINOR_VERSION:uint = 35;
      
      public function FlxG()
      {
         super();
      }
      
      public static function log(param1:Object) : void
      {
         if(_game != null && _game._console != null)
         {
            _game._console.log(param1 == null ? "ERROR: null object" : param1.toString());
         }
      }
      
      public static function get pause() : Boolean
      {
         return _pause;
      }
      
      public static function set pause(param1:Boolean) : void
      {
         var _loc2_:Boolean = _pause;
         _pause = param1;
         if(_pause != _loc2_)
         {
            if(_pause)
            {
               _game.pauseGame();
               pauseSounds();
            }
            else
            {
               _game.unpauseGame();
               playSounds();
            }
         }
      }
      
      public static function get showBounds() : Boolean
      {
         return _showBounds;
      }
      
      public static function set showBounds(param1:Boolean) : void
      {
         var _loc2_:Boolean = _showBounds;
         _showBounds = param1;
         if(_showBounds != _loc2_)
         {
            FlxObject._refreshBounds = true;
         }
      }
      
      public static function get framerate() : uint
      {
         return _game._framerate;
      }
      
      public static function set framerate(param1:uint) : void
      {
         _game._framerate = param1;
         if(!_game._paused && _game.stage != null)
         {
            _game.stage.frameRate = param1;
         }
      }
      
      public static function get frameratePaused() : uint
      {
         return _game._frameratePaused;
      }
      
      public static function set frameratePaused(param1:uint) : void
      {
         _game._frameratePaused = param1;
         if(_game._paused && _game.stage != null)
         {
            _game.stage.frameRate = param1;
         }
      }
      
      public static function resetInput() : void
      {
         keys.reset();
         mouse.reset();
      }
      
      public static function playMusic(param1:Class, param2:Number = 1) : void
      {
         if(music == null)
         {
            music = new FlxSound();
         }
         else if(music.active)
         {
            music.stop();
         }
         music.loadEmbedded(param1,true);
         music.volume = param2;
         music.survive = true;
         music.play();
      }
      
      public static function play(param1:Class, param2:Number = 1, param3:Boolean = false) : FlxSound
      {
         var _loc4_:uint = sounds.length;
         var _loc5_:uint = 0;
         while(_loc5_ < _loc4_)
         {
            if(!(sounds[_loc5_] as FlxSound).active)
            {
               break;
            }
            _loc5_++;
         }
         if(sounds[_loc5_] == null)
         {
            sounds[_loc5_] = new FlxSound();
         }
         var _loc6_:FlxSound = sounds[_loc5_];
         _loc6_.loadEmbedded(param1,param3);
         _loc6_.volume = param2;
         _loc6_.play();
         return _loc6_;
      }
      
      public static function stream(param1:String, param2:Number = 1, param3:Boolean = false) : FlxSound
      {
         var _loc4_:uint = sounds.length;
         var _loc5_:uint = 0;
         while(_loc5_ < _loc4_)
         {
            if(!(sounds[_loc5_] as FlxSound).active)
            {
               break;
            }
            _loc5_++;
         }
         if(sounds[_loc5_] == null)
         {
            sounds[_loc5_] = new FlxSound();
         }
         var _loc6_:FlxSound = sounds[_loc5_];
         _loc6_.loadStream(param1,param3);
         _loc6_.volume = param2;
         _loc6_.play();
         return _loc6_;
      }
      
      public static function get mute() : Boolean
      {
         return _mute;
      }
      
      public static function set mute(param1:Boolean) : void
      {
         _mute = param1;
         changeSounds();
      }
      
      public static function getMuteValue() : uint
      {
         if(_mute)
         {
            return 0;
         }
         return 1;
      }
      
      public static function get volume() : Number
      {
         return _volume;
      }
      
      public static function set volume(param1:Number) : void
      {
         _volume = param1;
         if(_volume < 0)
         {
            _volume = 0;
         }
         else if(_volume > 1)
         {
            _volume = 1;
         }
         changeSounds();
      }
      
      internal static function destroySounds(param1:Boolean = false) : void
      {
         var _loc2_:FlxSound = null;
         if(sounds == null)
         {
            return;
         }
         if(music != null && (param1 || !music.survive))
         {
            music.destroy();
         }
         var _loc3_:uint = sounds.length;
         var _loc4_:uint = 0;
         while(_loc4_ < _loc3_)
         {
            _loc2_ = sounds[_loc4_] as FlxSound;
            if(_loc2_ != null && (param1 || !_loc2_.survive))
            {
               _loc2_.destroy();
            }
            _loc4_++;
         }
      }
      
      protected static function changeSounds() : void
      {
         var _loc1_:FlxSound = null;
         if(music != null && music.active)
         {
            music.updateTransform();
         }
         var _loc2_:uint = sounds.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = sounds[_loc3_] as FlxSound;
            if(_loc1_ != null && _loc1_.active)
            {
               _loc1_.updateTransform();
            }
            _loc3_++;
         }
      }
      
      internal static function updateSounds() : void
      {
         var _loc1_:FlxSound = null;
         if(music != null && music.active)
         {
            music.update();
         }
         var _loc2_:uint = sounds.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = sounds[_loc3_] as FlxSound;
            if(_loc1_ != null && _loc1_.active)
            {
               _loc1_.update();
            }
            _loc3_++;
         }
      }
      
      protected static function pauseSounds() : void
      {
         var _loc1_:FlxSound = null;
         if(music != null && music.active)
         {
            music.pause();
         }
         var _loc2_:uint = sounds.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = sounds[_loc3_] as FlxSound;
            if(_loc1_ != null && _loc1_.active)
            {
               _loc1_.pause();
            }
            _loc3_++;
         }
      }
      
      protected static function playSounds() : void
      {
         var _loc1_:FlxSound = null;
         if(music != null && music.active)
         {
            music.play();
         }
         var _loc2_:uint = sounds.length;
         var _loc3_:uint = 0;
         while(_loc3_ < _loc2_)
         {
            _loc1_ = sounds[_loc3_] as FlxSound;
            if(_loc1_ != null && _loc1_.active)
            {
               _loc1_.play();
            }
            _loc3_++;
         }
      }
      
      public static function checkBitmapCache(param1:String) : Boolean
      {
         return _cache[param1] != undefined && _cache[param1] != null;
      }
      
      public static function createBitmap(param1:uint, param2:uint, param3:uint, param4:Boolean = false, param5:String = null) : BitmapData
      {
         var _loc7_:uint = 0;
         var _loc8_:String = null;
         var _loc6_:String = param5;
         if(_loc6_ == null)
         {
            _loc6_ = param1 + "x" + param2 + ":" + param3;
            if(param4 && _cache[_loc6_] != undefined && _cache[_loc6_] != null)
            {
               _loc7_ = 0;
               do
               {
                  _loc8_ = _loc6_ + _loc7_++;
               }
               while(_cache[_loc8_] != undefined && _cache[_loc8_] != null);
               _loc6_ = _loc8_;
            }
         }
         if(!checkBitmapCache(_loc6_))
         {
            _cache[_loc6_] = new BitmapData(param1,param2,true,param3);
         }
         return _cache[_loc6_];
      }
      
      public static function addBitmap(param1:Class, param2:Boolean = false, param3:Boolean = false, param4:String = null) : BitmapData
      {
         var _loc8_:uint = 0;
         var _loc9_:String = null;
         var _loc10_:BitmapData = null;
         var _loc11_:Matrix = null;
         var _loc5_:Boolean = false;
         var _loc6_:String = param4;
         if(_loc6_ == null)
         {
            _loc6_ = String(param1);
            if(param3 && _cache[_loc6_] != undefined && _cache[_loc6_] != null)
            {
               _loc8_ = 0;
               do
               {
                  _loc9_ = _loc6_ + _loc8_++;
               }
               while(_cache[_loc9_] != undefined && _cache[_loc9_] != null);
               _loc6_ = _loc9_;
            }
         }
         if(!checkBitmapCache(_loc6_))
         {
            _cache[_loc6_] = new param1().bitmapData;
            if(param2)
            {
               _loc5_ = true;
            }
         }
         var _loc7_:BitmapData = _cache[_loc6_];
         if(!_loc5_ && param2 && _loc7_.width == new param1().bitmapData.width)
         {
            _loc5_ = true;
         }
         if(_loc5_)
         {
            _loc10_ = new BitmapData(_loc7_.width << 1,_loc7_.height,true,0);
            _loc10_.draw(_loc7_);
            _loc11_ = new Matrix();
            _loc11_.scale(-1,1);
            _loc11_.translate(_loc10_.width,0);
            _loc10_.draw(_loc7_,_loc11_);
            _loc7_ = _loc10_;
         }
         return _loc7_;
      }
      
      public static function follow(param1:FlxObject, param2:Number = 1) : void
      {
         followTarget = param1;
         followLerp = param2;
         _scrollTarget.x = (width >> 1) - followTarget.x - (followTarget.width >> 1);
         _scrollTarget.y = (height >> 1) - followTarget.y - (followTarget.height >> 1);
         scroll.x = _scrollTarget.x;
         scroll.y = _scrollTarget.y;
         doFollow();
      }
      
      public static function followAdjust(param1:Number = 0, param2:Number = 0) : void
      {
         followLead = new Point(param1,param2);
      }
      
      public static function followBounds(param1:int = 0, param2:int = 0, param3:int = 0, param4:int = 0, param5:Boolean = true) : void
      {
         followMin = new Point(-param1,-param2);
         followMax = new Point(-param3 + width,-param4 + height);
         if(followMax.x > followMin.x)
         {
            followMax.x = followMin.x;
         }
         if(followMax.y > followMin.y)
         {
            followMax.y = followMin.y;
         }
         if(param5)
         {
            FlxU.setWorldBounds(param1,param2,param3 - param1,param4 - param2);
         }
         doFollow();
      }
      
      public static function get stage() : Stage
      {
         if(_game._state != null && _game._state.parent != null)
         {
            return _game._state.parent.stage;
         }
         return null;
      }
      
      public static function get state() : FlxState
      {
         return _game._state;
      }
      
      public static function set state(param1:FlxState) : void
      {
         _game.switchState(param1);
      }
      
      internal static function setGameData(param1:FlxGame, param2:uint, param3:uint, param4:uint) : void
      {
         _game = param1;
         _cache = new Object();
         width = param2;
         height = param3;
         _mute = false;
         _volume = 0.5;
         sounds = new Array();
         mouse = new FlxMouse();
         keys = new FlxKeyboard();
         scroll = null;
         _scrollTarget = null;
         unfollow();
         FlxG.levels = new Array();
         FlxG.scores = new Array();
         level = 0;
         score = 0;
         FlxU.seed = NaN;
         kong = null;
         pause = false;
         timeScale = 1;
         framerate = 860;
         frameratePaused = 10;
         maxElapsed = 0.0333333;
         FlxG.elapsed = 0;
         _showBounds = false;
         FlxObject._refreshBounds = false;
         panel = new FlxPanel();
         quake = new FlxQuake(param4);
         flash = new FlxFlash();
         fade = new FlxFade();
         FlxU.setWorldBounds(0,0,FlxG.width,FlxG.height);
      }
      
      internal static function doFollow() : void
      {
         if(followTarget != null)
         {
            _scrollTarget.x = (width >> 1) - followTarget.x - (followTarget.width >> 1);
            _scrollTarget.y = (height >> 1) - followTarget.y - (followTarget.height >> 1);
            if(followLead != null && followTarget is FlxSprite)
            {
            }
            scroll.x += (_scrollTarget.x - scroll.x) * followLerp * FlxG.elapsed;
            scroll.y += (_scrollTarget.y - scroll.y) * followLerp * FlxG.elapsed;
            if(followMin != null)
            {
               if(scroll.x > followMin.x)
               {
                  scroll.x = followMin.x;
               }
               if(scroll.y > followMin.y)
               {
                  scroll.y = followMin.y;
               }
            }
            if(followMax != null)
            {
               if(scroll.x < followMax.x)
               {
                  scroll.x = followMax.x;
               }
               if(scroll.y < followMax.y)
               {
                  scroll.y = followMax.y;
               }
            }
         }
      }
      
      internal static function unfollow() : void
      {
         followTarget = null;
         followLead = null;
         followLerp = 1;
         followMin = null;
         followMax = null;
         if(scroll == null)
         {
            scroll = new Point();
         }
         else
         {
            scroll.x = scroll.y = 0;
         }
         if(_scrollTarget == null)
         {
            _scrollTarget = new Point();
         }
         else
         {
            _scrollTarget.x = _scrollTarget.y = 0;
         }
      }
      
      internal static function updateInput() : void
      {
         keys.update();
         mouse.update(state.mouseX,state.mouseY,scroll.x,scroll.y);
      }
   }
}

