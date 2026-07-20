package org.flixel.data
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.Sprite;
   import flash.text.AntiAliasType;
   import flash.text.GridFitType;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import org.flixel.FlxG;
   import org.flixel.FlxMonitor;
   
   public class FlxConsole extends Sprite
   {
      
      public var mtrUpdate:FlxMonitor;
      
      public var mtrRender:FlxMonitor;
      
      public var mtrTotal:FlxMonitor;
      
      protected const MAX_CONSOLE_LINES:uint = 256;
      
      protected var _console:Sprite;
      
      protected var _text:TextField;
      
      protected var _fpsDisplay:TextField;
      
      protected var _extraDisplay:TextField;
      
      protected var _curFPS:uint;
      
      protected var _lines:Array;
      
      protected var _Y:Number;
      
      protected var _YT:Number;
      
      protected var _bx:int;
      
      protected var _by:int;
      
      protected var _byt:int;
      
      public function FlxConsole(param1:uint, param2:uint, param3:uint)
      {
         super();
         visible = false;
         x = param1 * param3;
         this._by = param2 * param3;
         this._byt = this._by - FlxG.height * param3;
         this._YT = this._Y = y = this._byt;
         var _loc4_:Bitmap = new Bitmap(new BitmapData(FlxG.width * param3,FlxG.height * param3 * 0.15,true,2130706432));
         addChild(_loc4_);
         this.mtrUpdate = new FlxMonitor(8);
         this.mtrRender = new FlxMonitor(8);
         this.mtrTotal = new FlxMonitor(8);
         this._text = new TextField();
         this._text.width = _loc4_.width;
         this._text.height = _loc4_.height;
         this._text.multiline = true;
         this._text.wordWrap = true;
         this._text.embedFonts = true;
         this._text.selectable = false;
         this._text.antiAliasType = AntiAliasType.NORMAL;
         this._text.gridFitType = GridFitType.PIXEL;
         this._text.defaultTextFormat = new TextFormat("system",8,16777215);
         addChild(this._text);
         this._fpsDisplay = new TextField();
         this._fpsDisplay.width = 100;
         this._fpsDisplay.x = _loc4_.width - 100;
         this._fpsDisplay.height = 20;
         this._fpsDisplay.multiline = true;
         this._fpsDisplay.wordWrap = true;
         this._fpsDisplay.embedFonts = true;
         this._fpsDisplay.selectable = false;
         this._fpsDisplay.antiAliasType = AntiAliasType.NORMAL;
         this._fpsDisplay.gridFitType = GridFitType.PIXEL;
         this._fpsDisplay.defaultTextFormat = new TextFormat("system",16,16777215,true,null,null,null,null,"right");
         addChild(this._fpsDisplay);
         this._extraDisplay = new TextField();
         this._extraDisplay.width = 100;
         this._extraDisplay.x = _loc4_.width - 100;
         this._extraDisplay.height = 64;
         this._extraDisplay.y = 20;
         this._extraDisplay.alpha = 0.5;
         this._extraDisplay.multiline = true;
         this._extraDisplay.wordWrap = true;
         this._extraDisplay.embedFonts = true;
         this._extraDisplay.selectable = false;
         this._extraDisplay.antiAliasType = AntiAliasType.NORMAL;
         this._extraDisplay.gridFitType = GridFitType.PIXEL;
         this._extraDisplay.defaultTextFormat = new TextFormat("system",8,16777215,true,null,null,null,null,"right");
         addChild(this._extraDisplay);
         this._lines = new Array();
      }
      
      public function log(param1:String) : void
      {
         var _loc2_:String = null;
         var _loc3_:uint = 0;
         if(param1 == null)
         {
            param1 = "NULL";
         }
         this._lines.push(param1);
         if(this._lines.length > this.MAX_CONSOLE_LINES)
         {
            this._lines.shift();
            _loc2_ = "";
            _loc3_ = 0;
            while(_loc3_ < this._lines.length)
            {
               _loc2_ += this._lines[_loc3_] + "\n";
               _loc3_++;
            }
            this._text.text = _loc2_;
         }
         else
         {
            this._text.appendText(param1 + "\n");
         }
         this._text.scrollV = this._text.height;
      }
      
      public function toggle() : void
      {
         if(this._YT == this._by)
         {
            this._YT = this._byt;
         }
         else
         {
            this._YT = this._by;
            visible = true;
         }
      }
      
      public function update() : void
      {
         var _loc1_:Number = this.mtrTotal.average();
         this._fpsDisplay.text = uint(1000 / _loc1_) + " fps";
         var _loc2_:uint = this.mtrUpdate.average();
         var _loc3_:uint = this.mtrRender.average();
         var _loc4_:uint = _loc2_ + _loc3_;
         var _loc5_:uint = uint(_loc1_);
         this._extraDisplay.text = _loc2_ + "ms update\n" + _loc3_ + "ms render\n" + _loc4_ + "ms flixel\n" + (_loc5_ - _loc4_) + "ms flash\n" + _loc5_ + "ms total";
         if(this._Y < this._YT)
         {
            this._Y += FlxG.height * 10 * FlxG.elapsed;
         }
         else if(this._Y > this._YT)
         {
            this._Y -= FlxG.height * 10 * FlxG.elapsed;
         }
         if(this._Y > this._by)
         {
            this._Y = this._by;
         }
         else if(this._Y < this._byt)
         {
            this._Y = this._byt;
            visible = false;
         }
         y = Math.floor(this._Y);
      }
   }
}

