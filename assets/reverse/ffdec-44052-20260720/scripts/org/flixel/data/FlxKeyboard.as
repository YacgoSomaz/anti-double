package org.flixel.data
{
   import flash.events.KeyboardEvent;
   
   public class FlxKeyboard
   {
      
      public var ESCAPE:Boolean;
      
      public var F1:Boolean;
      
      public var F2:Boolean;
      
      public var F3:Boolean;
      
      public var F4:Boolean;
      
      public var F5:Boolean;
      
      public var F6:Boolean;
      
      public var F7:Boolean;
      
      public var F8:Boolean;
      
      public var F9:Boolean;
      
      public var F10:Boolean;
      
      public var F11:Boolean;
      
      public var F12:Boolean;
      
      public var ONE:Boolean;
      
      public var TWO:Boolean;
      
      public var THREE:Boolean;
      
      public var FOUR:Boolean;
      
      public var FIVE:Boolean;
      
      public var SIX:Boolean;
      
      public var SEVEN:Boolean;
      
      public var EIGHT:Boolean;
      
      public var NINE:Boolean;
      
      public var ZERO:Boolean;
      
      public var MINUS:Boolean;
      
      public var PLUS:Boolean;
      
      public var DELETE:Boolean;
      
      public var BACKSPACE:Boolean;
      
      public var Q:Boolean;
      
      public var W:Boolean;
      
      public var E:Boolean;
      
      public var R:Boolean;
      
      public var T:Boolean;
      
      public var Y:Boolean;
      
      public var U:Boolean;
      
      public var I:Boolean;
      
      public var O:Boolean;
      
      public var P:Boolean;
      
      public var LBRACKET:Boolean;
      
      public var RBRACKET:Boolean;
      
      public var BACKSLASH:Boolean;
      
      public var CAPSLOCK:Boolean;
      
      public var A:Boolean;
      
      public var S:Boolean;
      
      public var D:Boolean;
      
      public var F:Boolean;
      
      public var G:Boolean;
      
      public var H:Boolean;
      
      public var J:Boolean;
      
      public var K:Boolean;
      
      public var L:Boolean;
      
      public var SEMICOLON:Boolean;
      
      public var QUOTE:Boolean;
      
      public var ENTER:Boolean;
      
      public var SHIFT:Boolean;
      
      public var Z:Boolean;
      
      public var X:Boolean;
      
      public var C:Boolean;
      
      public var V:Boolean;
      
      public var B:Boolean;
      
      public var N:Boolean;
      
      public var M:Boolean;
      
      public var COMMA:Boolean;
      
      public var PERIOD:Boolean;
      
      public var SLASH:Boolean;
      
      public var CONTROL:Boolean;
      
      public var ALT:Boolean;
      
      public var SPACE:Boolean;
      
      public var UP:Boolean;
      
      public var DOWN:Boolean;
      
      public var LEFT:Boolean;
      
      public var RIGHT:Boolean;
      
      protected var _lookup:Object;
      
      protected var _map:Array;
      
      protected const _t:uint = 256;
      
      public function FlxKeyboard()
      {
         super();
         var _loc1_:uint = 0;
         this._lookup = new Object();
         this._map = new Array(this._t);
         _loc1_ = 65;
         while(_loc1_ <= 90)
         {
            this.addKey(String.fromCharCode(_loc1_),_loc1_);
            _loc1_++;
         }
         _loc1_ = 48;
         this.addKey("ZERO",_loc1_++);
         this.addKey("ONE",_loc1_++);
         this.addKey("TWO",_loc1_++);
         this.addKey("THREE",_loc1_++);
         this.addKey("FOUR",_loc1_++);
         this.addKey("FIVE",_loc1_++);
         this.addKey("SIX",_loc1_++);
         this.addKey("SEVEN",_loc1_++);
         §§push(this);
         §§push("EIGHT");
         var _temp_9:* = _loc1_;
         §§pop().addKey(§§pop(),_loc1_++);
         this.addKey("NINE",_loc1_++);
         _loc1_ = 1;
         while(_loc1_ <= 12)
         {
            this.addKey("F" + _loc1_,111 + _loc1_);
            _loc1_++;
         }
         this.addKey("ESCAPE",27);
         this.addKey("MINUS",189);
         this.addKey("PLUS",187);
         this.addKey("DELETE",46);
         this.addKey("BACKSPACE",8);
         this.addKey("LBRACKET",219);
         this.addKey("RBRACKET",221);
         this.addKey("BACKSLASH",220);
         this.addKey("CAPSLOCK",20);
         this.addKey("SEMICOLON",186);
         this.addKey("QUOTE",222);
         this.addKey("ENTER",13);
         this.addKey("SHIFT",16);
         this.addKey("COMMA",188);
         this.addKey("PERIOD",190);
         this.addKey("SLASH",191);
         this.addKey("CONTROL",17);
         this.addKey("ALT",18);
         this.addKey("SPACE",32);
         this.addKey("UP",38);
         this.addKey("DOWN",40);
         this.addKey("LEFT",37);
         this.addKey("RIGHT",39);
      }
      
      public function update() : void
      {
         var _loc2_:Object = null;
         var _loc1_:uint = 0;
         while(_loc1_ < this._t)
         {
            if(this._map[_loc1_] != null)
            {
               _loc2_ = this._map[_loc1_];
               if(_loc2_.last == -1 && _loc2_.current == -1)
               {
                  _loc2_.current = 0;
               }
               else if(_loc2_.last == 2 && _loc2_.current == 2)
               {
                  _loc2_.current = 1;
               }
               _loc2_.last = _loc2_.current;
            }
            _loc1_++;
         }
      }
      
      public function reset() : void
      {
         var _loc2_:Object = null;
         var _loc1_:uint = 0;
         while(_loc1_ < this._t)
         {
            if(this._map[_loc1_] != null)
            {
               _loc2_ = this._map[_loc1_];
               this[_loc2_.name] = false;
               _loc2_.current = 0;
               _loc2_.last = 0;
            }
            _loc1_++;
         }
      }
      
      public function pressed(param1:String) : Boolean
      {
         return this[param1];
      }
      
      public function justPressed(param1:String) : Boolean
      {
         return this._map[this._lookup[param1]].current == 2;
      }
      
      public function justReleased(param1:String) : Boolean
      {
         return this._map[this._lookup[param1]].current == -1;
      }
      
      public function handleKeyDown(param1:KeyboardEvent) : void
      {
         var _loc2_:Object = this._map[param1.keyCode];
         if(_loc2_ == null)
         {
            return;
         }
         if(_loc2_.current > 0)
         {
            _loc2_.current = 1;
         }
         else
         {
            _loc2_.current = 2;
         }
         this[_loc2_.name] = true;
      }
      
      public function handleKeyUp(param1:KeyboardEvent) : void
      {
         var _loc2_:Object = this._map[param1.keyCode];
         if(_loc2_ == null)
         {
            return;
         }
         if(_loc2_.current > 0)
         {
            _loc2_.current = -1;
         }
         else
         {
            _loc2_.current = 0;
         }
         this[_loc2_.name] = false;
      }
      
      protected function addKey(param1:String, param2:uint) : void
      {
         this._lookup[param1] = param2;
         this._map[param2] = {
            "name":param1,
            "current":0,
            "last":0
         };
      }
   }
}

