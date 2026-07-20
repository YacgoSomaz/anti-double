package
{
   import com.miniclip.GSwitch.MenuState;
   import org.flixel.FlxG;
   import org.flixel.FlxGame;
   import org.flixel.FlxState;
   
   public class GSwitch extends FlxGame
   {
      
      public function GSwitch()
      {
         FlxG.start = true;
         super(640,501,MenuState,1);
         FlxState.bgColor = 4278190080;
         useDefaultHotKeys = true;
      }
   }
}

