package com.miniclip.GSwitch
{
   import org.flixel.*;
   
   public class Enemy extends FlxSprite
   {
      
      private var ImgPlayer:Class = Enemy_ImgPlayer;
      
      private var SndJump:Class = Enemy_SndJump;
      
      private var SndLand:Class = Enemy_SndLand;
      
      private var SndExplode:Class = Enemy_SndExplode;
      
      private var SndExplode2:Class = Enemy_SndExplode2;
      
      private var SndHurt:Class = Enemy_SndHurt;
      
      private var SndJam:Class = Enemy_SndJam;
      
      private var _jumpPower:int;
      
      private var _up:Boolean;
      
      private var _down:Boolean;
      
      private var _restart:Number;
      
      private var _savedXVel:Number = 0;
      
      private var _clickDelay:Number = 0;
      
      protected var myOnFloor:Boolean = true;
      
      public function Enemy(param1:int, param2:int, param3:Number = 0, param4:Number = 0, param5:uint = 1)
      {
         super(param1,param2);
         loadGraphic(this.ImgPlayer,true,true,65,77);
         this._restart = 0;
         health = -999;
         width = 42;
         height = 48;
         offset.x = 10;
         offset.y = 12;
         velocity.x = param3;
         velocity.y = param4;
         var _loc6_:uint = 80;
         acceleration.x = 7.740191;
         acceleration.y = 30000;
         this._jumpPower = 200;
         maxVelocity.y = 320.755;
         addAnimation("idle",[0]);
         addAnimation("run",[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],20);
         addAnimation("fall",[15,16,17,18,19,20,21,22,23,24],12);
         addAnimation("switch",[45,47,49,51,53,55,57,59,61],30);
         addAnimation("push",[30,31,32,33,34,35,36,37,38,39],15);
         addAnimation("landing",[71,73,75,65,67,69],30);
         addAnimation("slide",[88,87,89],20);
         addAnimation("runfast",[77,78,79,80,81,82,83,84,85],20);
         play("run");
         this.myOnFloor = true;
         addAnimationCallback(this.animationCallback);
         if(param5 == LEFT)
         {
            angle = 180;
            facing = LEFT;
            offset.y = 11;
         }
      }
      
      override public function update() : void
      {
         var _loc1_:int = 0;
         if(angle < 0)
         {
            angle = 0;
            angularVelocity = 0;
         }
         if(angle > 180)
         {
            angle = 180;
            angularVelocity = 0;
         }
         if(dead)
         {
            this._restart += FlxG.elapsed;
            if(this._restart > 2)
            {
               (FlxG.state as PlayState).reload = true;
            }
            return;
         }
         acceleration.x = 6.9440061776;
         if(FlxG.enemySwitch.length > 0 && x >= FlxG.enemySwitch[0])
         {
            if(velocity.y == 0)
            {
               this.SwitchGravity();
               _loc1_ = 0;
               while(_loc1_ < FlxG.enemySwitch.length - 1)
               {
                  FlxG.enemySwitch[_loc1_] = FlxG.enemySwitch[_loc1_ + 1];
                  _loc1_++;
               }
               --FlxG.enemySwitch.length;
               this._clickDelay = 0;
            }
            else
            {
               this._clickDelay = 10;
            }
         }
         if(this._clickDelay > 0)
         {
            if(this._clickDelay < 0)
            {
               this._clickDelay = 0;
            }
            if(velocity.y == 0)
            {
               this.SwitchGravity();
               this._clickDelay = 0;
               _loc1_ = 0;
               while(_loc1_ < FlxG.enemySwitch.length - 1)
               {
                  FlxG.enemySwitch[_loc1_] = FlxG.enemySwitch[_loc1_ + 1];
                  _loc1_++;
               }
               --FlxG.enemySwitch.length;
            }
         }
         if(_curAnim.name == "slide")
         {
            changeAnimFrameRate("slide",velocity.x * 0.03);
         }
         if(velocity.y != 0)
         {
            this.myOnFloor = false;
            if(FlxG.numPlayers == 1 && _curAnim.name != "switch")
            {
               play("fall");
            }
         }
         else if(velocity.x == 0)
         {
            this.myOnFloor = true;
            play("idle");
         }
         else if(velocity.y == 0)
         {
            if(_curAnim.name != "switch")
            {
               this.myOnFloor = true;
            }
            this.myOnFloor = true;
            if(_curAnim.name == "fall" && _curAnim.name != "switch")
            {
               play("landing");
            }
            if(_curAnim.name != "push" && _curAnim.name != "switch" && _curAnim.name != "landing" && _curAnim.name != "slide" && _curAnim.name != "runfast")
            {
               play("run");
            }
         }
         if(_curAnim.name == "run")
         {
            changeAnimFrameRate("run",velocity.x * 0.088);
            if(velocity.x >= 513.208)
            {
               play("runfast");
            }
         }
         if(_curAnim.name == "runfast")
         {
            changeAnimFrameRate("runfast",velocity.x * 0.088);
            if(velocity.x < 513.208)
            {
               play("run");
            }
         }
         if(_curAnim.name == "push")
         {
            changeAnimFrameRate("push",velocity.x * 0.03);
         }
         if(_curAnim.name == "slide")
         {
            changeAnimFrameRate("slide",velocity.x * 0.03);
         }
         if(_curAnim.name == "landing")
         {
            changeAnimFrameRate("landing",67);
         }
         if(!FlxG.showIntersticial && FlxG.timeToReload > 899)
         {
            if(x < FlxG.cameraX - 290)
            {
               x += FlxG.elapsed * 34;
            }
            else
            {
               x -= FlxG.elapsed * 12;
            }
            if(x < FlxG.cameraX - 375)
            {
               x += FlxG.elapsed * 50;
            }
         }
         if(FlxG.timeToReload < 900)
         {
            if(velocity.x > 14 && (velocity.y < 0.1 && velocity.y > -0.1))
            {
               velocity.x -= FlxG.elapsed * 700;
            }
            if(velocity.x <= 14)
            {
               velocity.x = 0;
               acceleration.x = 0;
               drag.x = 0;
            }
         }
         super.update();
      }
      
      override public function hitBottom(param1:FlxObject, param2:Number) : void
      {
         onFloor = true;
         return super.hitBottom(param1,param2);
      }
      
      override public function hurt(param1:Number) : void
      {
         param1 = 0;
         if(flickering())
         {
            return;
         }
         FlxG.play(this.SndHurt);
         flicker(1.3);
         if(FlxG.score > 1000)
         {
            FlxG.score -= 1000;
         }
         if(velocity.x > 0)
         {
            velocity.x = -maxVelocity.x;
         }
         else
         {
            velocity.x = maxVelocity.x;
         }
         super.hurt(param1);
      }
      
      override public function kill() : void
      {
         if(dead)
         {
            return;
         }
         solid = false;
         FlxG.play(this.SndExplode);
         FlxG.play(this.SndExplode2);
         super.kill();
         flicker(-1);
         exists = true;
         visible = false;
         FlxG.quake.start(0.005,0.35);
         FlxG.flash.start(4292406178,0.35);
      }
      
      public function SwitchGravity() : void
      {
         if(FlxG.timeToReload < 999)
         {
            return;
         }
         play("switch",true);
         this.myOnFloor = false;
         acceleration.y *= -1;
         if(facing == LEFT)
         {
            angle = 180;
            facing = RIGHT;
            offset.y = 12;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].exists = true;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].play("puff",true);
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].x = x - 37;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].y = y - 55;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].angle = 180;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].facing = LEFT;
            var _loc1_:PlayState = PlayState;
            var _loc2_:Number = _loc1_.puffIndex + 1;
            _loc1_.puffIndex = _loc2_;
            if(PlayState.puffIndex >= (FlxG.state as PlayState).puffs.members.length)
            {
               PlayState.puffIndex = 0;
            }
         }
         else
         {
            angle = 0;
            facing = LEFT;
            offset.y = 11;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].exists = true;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].play("puff",true);
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].x = x - 37;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].y = y - 20;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].angle = 0;
            (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].facing = RIGHT;
            ++PlayState.puffIndex;
            if(PlayState.puffIndex >= (FlxG.state as PlayState).puffs.members.length)
            {
               PlayState.puffIndex = 0;
            }
         }
      }
      
      public function animationCallback(param1:String, param2:uint, param3:uint) : void
      {
         if(param1 == "landing" && param3 == 69)
         {
            play("run");
         }
         if(param1 == "switch")
         {
            if(facing == RIGHT)
            {
               if(angle > 0)
               {
                  angularVelocity = -1800;
               }
            }
            else if(facing == LEFT)
            {
               if(angle < 180)
               {
                  angularVelocity = 1800;
               }
            }
            if(param3 == 61)
            {
               play("fall");
               this.myOnFloor = false;
            }
            else if(param3 > 45 && this.myOnFloor)
            {
               if(facing == RIGHT)
               {
                  angle = 0;
               }
               else
               {
                  angle = 180;
               }
               angularVelocity = 0;
               play("landing");
            }
         }
         else
         {
            if(facing == RIGHT)
            {
               angle = 0;
            }
            else
            {
               angle = 180;
            }
            angularVelocity = 0;
         }
      }
      
      override public function hitRight(param1:FlxObject, param2:Number) : void
      {
         if(_curAnim.name != "death" && _curAnim.name != "switch")
         {
            if(this.myOnFloor)
            {
               play("push");
            }
            else
            {
               play("slide");
            }
         }
      }
   }
}

