package org.flixel
{
   import flash.net.SharedObject;
   import flash.net.SharedObjectFlushStatus;
   
   public class FlxSave
   {
      
      public var data:Object;
      
      public var name:String;
      
      protected var _so:SharedObject;
      
      public function FlxSave()
      {
         super();
         this.name = null;
         this._so = null;
         this.data = null;
      }
      
      public function bind(param1:String) : Boolean
      {
         var Name:String = param1;
         this.name = null;
         this._so = null;
         this.data = null;
         this.name = Name;
         try
         {
            this._so = SharedObject.getLocal(this.name);
         }
         catch(e:Error)
         {
            FlxG.log("WARNING: There was a problem binding to\nthe shared object data from FlxSave.");
            name = null;
            _so = null;
            data = null;
            return false;
         }
         this.data = this._so.data;
         return true;
      }
      
      public function write(param1:String, param2:Object, param3:uint = 0) : Boolean
      {
         if(this._so == null)
         {
            FlxG.log("WARNING: You must call FlxSave.bind()\nbefore calling FlxSave.write().");
            return false;
         }
         this.data[param1] = param2;
         return this.forceSave(param3);
      }
      
      public function read(param1:String) : Object
      {
         if(this._so == null)
         {
            FlxG.log("WARNING: You must call FlxSave.bind()\nbefore calling FlxSave.read().");
            return null;
         }
         return this.data[param1];
      }
      
      public function forceSave(param1:uint = 0) : Boolean
      {
         var status:Object;
         var MinFileSize:uint = param1;
         if(this._so == null)
         {
            FlxG.log("WARNING: You must call FlxSave.bind()\nbefore calling FlxSave.forceSave().");
            return false;
         }
         status = null;
         try
         {
            status = this._so.flush(MinFileSize);
         }
         catch(e:Error)
         {
            FlxG.log("WARNING: There was a problem flushing\nthe shared object data from FlxSave.");
            return false;
         }
         return status == SharedObjectFlushStatus.FLUSHED;
      }
      
      public function erase(param1:uint = 0) : Boolean
      {
         if(this._so == null)
         {
            FlxG.log("WARNING: You must call FlxSave.bind()\nbefore calling FlxSave.erase().");
            return false;
         }
         this._so.clear();
         return this.forceSave(param1);
      }
   }
}

