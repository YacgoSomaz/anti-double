package org.flixel.data
{
   import flash.display.Loader;
   import flash.display.LoaderInfo;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.net.URLRequest;
   
   public class FlxKong extends Sprite
   {
      
      public var API:*;
      
      public function FlxKong()
      {
         super();
         this.API = null;
      }
      
      public function init() : void
      {
         var _loc1_:Object = LoaderInfo(root.loaderInfo).parameters;
         var _loc2_:String = _loc1_.api_path || "http://www.kongregate.com/flash/API_AS3_Local.swf";
         var _loc3_:URLRequest = new URLRequest(_loc2_);
         var _loc4_:Loader = new Loader();
         _loc4_.contentLoaderInfo.addEventListener(Event.COMPLETE,this.APILoaded);
         _loc4_.load(_loc3_);
         this.addChild(_loc4_);
      }
      
      protected function APILoaded(param1:Event) : void
      {
         this.API = param1.target.content;
         this.API.services.connect();
      }
   }
}

