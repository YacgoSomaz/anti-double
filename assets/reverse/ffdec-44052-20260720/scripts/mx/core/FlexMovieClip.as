package mx.core
{
   import flash.display.MovieClip;
   import mx.utils.NameUtil;
   
   use namespace mx_internal;
   
   public class FlexMovieClip extends MovieClip
   {
      
      mx_internal static const VERSION:String = "4.0.0.14159";
      
      public function FlexMovieClip()
      {
         super();
         try
         {
            name = NameUtil.createUniqueName(this);
         }
         catch(e:Error)
         {
         }
      }
      
      override public function toString() : String
      {
         return NameUtil.displayObjectToString(this);
      }
   }
}

