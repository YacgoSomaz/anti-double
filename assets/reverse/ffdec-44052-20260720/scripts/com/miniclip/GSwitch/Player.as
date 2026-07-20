package com.miniclip.GSwitch
{
   import org.flixel.*;
   
   public class Player extends FlxSprite
   {
      
      public static var currentStanding:int = 0;
      
      private var ImgPlayer:Class = Player_ImgPlayer;
      
      private var ImgPlayerYellow:Class = Player_ImgPlayerYellow;
      
      private var ImgPlayerGreen:Class = Player_ImgPlayerGreen;
      
      private var ImgPlayerRed:Class = Player_ImgPlayerRed;
      
      private var SndJump:Class = Player_SndJump;
      
      private var SndLand:Class = Player_SndLand;
      
      private var SndExplode:Class = Player_SndExplode;
      
      private var SndExplode2:Class = Player_SndExplode2;
      
      private var SndHurt:Class = Player_SndHurt;
      
      private var SndJam:Class = Player_SndJam;
      
      private var _jumpPower:int;
      
      private var _up:Boolean;
      
      private var _down:Boolean;
      
      private var _restart:Number;
      
      private var _savedXVel:Number = 0;
      
      private var _clickDelay:Number = 0;
      
      public var playFallDelay:int = 4;
      
      protected var _playerNum:uint = 1;
      
      public var myOnFloor:Boolean = true;
      
      public var standing:int = 0;
      
      public var wins:uint = 0;
      
      public var inPlayerCollision:Boolean = false;
      
      public function Player(param1:int, param2:int, param3:Number = 0, param4:Number = 0, param5:uint = 1, param6:uint = 0)
      {
         super(param1,param2);
         this.wins = param6;
         this._playerNum = param5;
         if(param5 == 1)
         {
            loadGraphic(this.ImgPlayer,true,true,65,77);
         }
         if(param5 == 2)
         {
            loadGraphic(this.ImgPlayerGreen,true,true,65,77);
         }
         if(param5 == 3)
         {
            loadGraphic(this.ImgPlayerYellow,true,true,65,77);
         }
         if(param5 == 4)
         {
            loadGraphic(this.ImgPlayerRed,true,true,65,77);
         }
         this._restart = 0;
         width = 42;
         height = 48;
         offset.x = 10;
         offset.y = 17;
         if(FlxG.numPlayers > 1)
         {
            width = 37;
            offset.x = 16;
            offset.y = 19;
         }
         this._savedXVel = param3;
         velocity.x = 0;
         velocity.y = 0;
         var _loc7_:uint = 80;
         if(!FlxG.credits)
         {
            acceleration.x = 7.740191;
         }
         else
         {
            acceleration.x = 0;
         }
         acceleration.y = 30000;
         this._jumpPower = 200;
         maxVelocity.y = 320.755;
         addAnimation("idle",[0]);
         addAnimation("run",[0,1,2,3,4,5,6,7,8,9,10,11,12],20);
         addAnimation("fall",[19,20,21,22,13,14,15,16,17,18],12);
         addAnimation("morph",[23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],20);
         addAnimation("death",[45,46,47,48,49,50,51],10,false);
         addAnimation("switch",[60,62,64,66,70,72,74],27);
         addAnimation("push",[52,53,54,55,56,57,58],15);
         addAnimation("landing",[76,78,80,82,84,86],30);
         addAnimation("slide",[89],20);
         addAnimation("runfast",[91,92,93,94,95,96,97,98,99],20);
         play("morph");
         this.myOnFloor = true;
         addAnimationCallback(this.animationCallback);
      }
      
      override public function update() : void
      {
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
         if(_curAnim.name == "morph")
         {
            if(velocity.x != 0 && FlxG.numPlayers == 1)
            {
               this._savedXVel = velocity.x;
               velocity.x = 0;
            }
            if(!FlxG.tutorial && !FlxG.showIntersticial)
            {
               super.update();
            }
            if(FlxG.tutorial && FlxG.numPlayers > 1 && _curFrame < 17)
            {
               super.update();
            }
            if(_curFrame == 17)
            {
            }
            return;
         }
         if(_curAnim.name == "death")
         {
            if(!FlxG.showIntersticial)
            {
               super.update();
            }
            return;
         }
         if(dead)
         {
         }
         if(!FlxG.credits)
         {
            acceleration.x = 6.9440061776;
         }
         if((FlxG.mouse.justPressed() && FlxG.stage.mouseY > 59 || FlxG.keys.justPressed("X") || FlxG.keys.justPressed("SPACE")) && this._playerNum == 1 || FlxG.keys.justPressed("M") && this._playerNum == 2 || FlxG.keys.justPressed("P") && this._playerNum == 3 || FlxG.keys.justPressed("Q") && this._playerNum == 4)
         {
            if(velocity.y == 0)
            {
               if(x < 122400)
               {
                  this.SwitchGravity();
               }
            }
            else if(x < 122400)
            {
               this._clickDelay = 0.35;
            }
         }
         if(this._clickDelay > 0)
         {
            this._clickDelay -= FlxG.elapsed;
            if(this._clickDelay < 0)
            {
               this._clickDelay = 0;
            }
            if(velocity.y == 0)
            {
               this.SwitchGravity();
               FlxG.play(this.SndLand);
               this._clickDelay = 0;
            }
         }
         if(_curAnim.name == "slide")
         {
            changeAnimFrameRate("slide",velocity.x * 0.03);
            if(FlxG.mute == false)
            {
               (FlxG.state as PlayState).slideLoop.play();
            }
         }
         else if((FlxG.state as PlayState).slideLoop.playing)
         {
            (FlxG.state as PlayState).slideLoop.stop();
         }
         if(velocity.y != 0)
         {
            this.myOnFloor = false;
            if(FlxG.numPlayers == 1 && _curAnim.name != "switch")
            {
               play("fall");
            }
            else if(FlxG.numPlayers > 1)
            {
               if(this.playFallDelay == 0 && _curAnim.name != "switch" || _curAnim.name == "slide")
               {
                  play("fall");
               }
               else
               {
                  --this.playFallDelay;
               }
            }
         }
         else if(velocity.x == 0)
         {
            this.myOnFloor = true;
            this.playFallDelay = 4;
            play("idle");
         }
         else if(velocity.y == 0)
         {
            if(_curAnim.name != "switch")
            {
               this.myOnFloor = true;
            }
            this.myOnFloor = true;
            this.playFallDelay = 4;
            if(_curAnim.name == "fall" && _curAnim.name != "switch")
            {
               play("landing");
               FlxG.play(this.SndLand,0.7);
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
         if(FlxG.numPlayers > 1)
         {
            if(x < (FlxG.state as PlayState)._camera.x - 350)
            {
               this.kill();
            }
            if(y > 500)
            {
               this.kill();
            }
            if(y < -60)
            {
               this.kill();
            }
         }
         if(FlxG.numPlayers == 1)
         {
            if(x < (FlxG.state as PlayState)._camera.x - 330 && !FlxG.credits)
            {
               play("death");
            }
         }
         if(!FlxG.tutorial && !FlxG.showIntersticial)
         {
            super.update();
         }
      }
      
      override public function hitBottom(param1:FlxObject, param2:Number) : void
      {
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
         exists = true;
         visible = false;
         if(FlxG.numPlayers > 1)
         {
            this.standing = currentStanding;
            if(this.standing == 1)
            {
               if(this._playerNum == 1)
               {
                  ++PlayState.p1wins;
               }
               if(this._playerNum == 2)
               {
                  var _loc1_:PlayState = PlayState;
                  var _loc2_:Number = _loc1_.p2wins + 1;
                  _loc1_.p2wins = _loc2_;
               }
               if(this._playerNum == 3)
               {
                  ++PlayState.p3wins;
               }
               if(this._playerNum == 4)
               {
                  ++PlayState.p4wins;
               }
               ++this.wins;
            }
            --currentStanding;
         }
         super.kill();
      }
      
      public function SwitchGravity() : void
      {
         if(_curAnim.name != "morph")
         {
            play("switch",true);
            FlxG.play(SndSwitch);
         }
         this.myOnFloor = false;
         acceleration.y *= -1;
         if(facing == LEFT)
         {
            angle = 180;
            facing = RIGHT;
            offset.y = 17;
            if(FlxG.numPlayers > 1)
            {
               offset.y = 19;
            }
            if(_curAnim.name != "morph")
            {
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].exists = true;
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].play("puff",true);
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].x = x - 37;
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].y = y - 55;
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].angle = 180;
               (FlxG.state as PlayState).puffs.members[PlayState.puffIndex].facing = LEFT;
               ++PlayState.puffIndex;
               if(PlayState.puffIndex >= (FlxG.state as PlayState).puffs.members.length)
               {
                  PlayState.puffIndex = 0;
               }
            }
         }
         else
         {
            angle = 0;
            facing = LEFT;
            offset.y = 7;
            if(FlxG.numPlayers > 1)
            {
               offset.y = 9;
            }
            if(_curAnim.name != "morph")
            {
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
         if(FlxG.numPlayers == 1)
         {
            FlxG.enemySwitch.push(x);
         }
      }
      
      public function animationCallback(param1:String, param2:uint, param3:uint) : void
      {
         if(param1 == "morph" && param3 == 24)
         {
            if(this._playerNum == 1)
            {
               FlxG.play(SndMorph);
            }
         }
         if(param1 == "morph" && param3 == 44)
         {
            play("run");
            this.myOnFloor = true;
            if(FlxG.useCam)
            {
               FlxG.follow((FlxG.state as PlayState)._camera,35);
            }
            velocity.x = this._savedXVel;
            if(FlxG.numPlayers > 1)
            {
               if(FlxG.round == 1 || FlxG.round == 4)
               {
                  (FlxG.state as PlayState)._camera.velocity.x = 160.3775;
               }
               if(FlxG.round == 2 || FlxG.round == 5)
               {
                  (FlxG.state as PlayState)._camera.velocity.x = 153.9624;
               }
               if(FlxG.round == 3 || FlxG.round == 6)
               {
                  (FlxG.state as PlayState)._camera.velocity.x = 153.9624;
               }
               (FlxG.state as PlayState)._camera.acceleration.x = 7.740191;
            }
         }
         if(param1 == "death" && param3 == 51 && FlxG.numPlayers == 1)
         {
            visible = false;
            this.kill();
            FlxG.timeToReload = 1.6;
         }
         if(param1 == "landing" && param3 == 86)
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
            if(param3 == 74)
            {
               play("fall");
               this.myOnFloor = false;
            }
            else if(param3 > 60 && this.myOnFloor)
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
               FlxG.play(this.SndLand,0.7);
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
            else if(this.playFallDelay == 0 || FlxG.numPlayers == 1)
            {
               play("slide");
            }
         }
      }
   }
}

