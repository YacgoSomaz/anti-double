package org.flixel
{
   import flash.utils.ByteArray;
   import mx.core.MovieClipLoaderAsset;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol22")]
   public class FlxPreloader_FlashAds extends MovieClipLoaderAsset
   {
      
      private static var bytes:ByteArray = null;
      
      public var dataClass:Class = FlxPreloader_FlashAds_dataClass;
      
      public function FlxPreloader_FlashAds()
      {
         super();
         initialWidth = 12800 / 20;
         initialHeight = 10020 / 20;
      }
      
      override public function get movieClipData() : ByteArray
      {
         if(bytes == null)
         {
            bytes = ByteArray(new this.dataClass());
         }
         return bytes;
      }
   }
}

