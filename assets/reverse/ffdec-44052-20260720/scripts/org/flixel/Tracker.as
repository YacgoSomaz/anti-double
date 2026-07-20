package org.flixel
{
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   
   public class Tracker
   {
      
      public var loader:URLLoader;
      
      public function Tracker()
      {
         super();
         this.loader = new URLLoader();
      }
      
      public function loadPlay() : void
      {
         this.loader.load(new URLRequest("http://ads.miniclip.com/RealMedia/ads/adstream_sx.ads/miniclip.com/Gravityguy_play/" + (uint(FlxU.random() * 899999) + 100000) + "@x01"));
      }
      
      public function loadMulti() : void
      {
         this.loader.load(new URLRequest("http://ads.miniclip.com/RealMedia/ads/adstream_sx.ads/miniclip.com/Gravityguy_multiplayer/" + (uint(FlxU.random() * 899999) + 100000) + "@x01"));
      }
      
      public function loadITunes() : void
      {
         this.loader.load(new URLRequest("http://ads.miniclip.com/RealMedia/ads/adstream_sx.ads/miniclip.com/Gravityguy_itunes/" + (uint(FlxU.random() * 899999) + 100000) + "@x01"));
      }
   }
}

