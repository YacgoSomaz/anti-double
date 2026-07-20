package com.miniclip.GSwitch
{
   import flash.utils.ByteArray;
   import org.flixel.*;
   import org.flixel.data.FlxPause;
   
   public class PlayState extends FlxState
   {
      
      public static var checkpointSave:FlxSave;
      
      public static var ImgSubmitScore:Class = PlayState_ImgSubmitScore;
      
      public static var ImgSubmitScoreHL:Class = PlayState_ImgSubmitScoreHL;
      
      public static var ImgScreenshot2:Class = PlayState_ImgScreenshot2;
      
      public static var ImgScreenshot3:Class = PlayState_ImgScreenshot3;
      
      public static var ImgContinueInt:Class = PlayState_ImgContinueInt;
      
      public static var ImgContinueIntOver:Class = PlayState_ImgContinueIntOver;
      
      public static var ImgGetItNowOn:Class = PlayState_ImgGetItNowOn;
      
      public static var ImgGetItNowOff:Class = PlayState_ImgGetItNowOff;
      
      public static const sp1plist:Class = PlayState_sp1plist;
      
      public static const sp2plist:Class = PlayState_sp2plist;
      
      public static const sp3plist:Class = PlayState_sp3plist;
      
      public static const sp4plist:Class = PlayState_sp4plist;
      
      public static const sp5plist:Class = PlayState_sp5plist;
      
      public static const sp6plist:Class = PlayState_sp6plist;
      
      public static const sp7plist:Class = PlayState_sp7plist;
      
      public static const mp02plist:Class = PlayState_mp02plist;
      
      public static const mp03plist:Class = PlayState_mp03plist;
      
      public static const mp04plist:Class = PlayState_mp04plist;
      
      public static const creditsplist:Class = PlayState_creditsplist;
      
      public static var puffIndex:int = 0;
      
      public static var p1wins:uint = 0;
      
      public static var p2wins:uint = 0;
      
      public static var p3wins:uint = 0;
      
      public static var p4wins:uint = 0;
      
      public static var multiStartFlicker:Number = 0.5;
      
      protected var ImgCoverupR2_1:Class = PlayState_ImgCoverupR2_1;
      
      protected var ImgCoverupR2_2:Class = PlayState_ImgCoverupR2_2;
      
      protected var ImgCoverupR2_3:Class = PlayState_ImgCoverupR2_3;
      
      protected var ImgCoverupR3_1:Class = PlayState_ImgCoverupR3_1;
      
      protected var ImgCoverupR3_2:Class = PlayState_ImgCoverupR3_2;
      
      protected var ImgCoverupEnd:Class = PlayState_ImgCoverupEnd;
      
      protected var ImgEmptyTile:Class = PlayState_ImgEmptyTile;
      
      protected var ImgBlock:Class = PlayState_ImgBlock;
      
      protected var ImgSpeed:Class = PlayState_ImgSpeed;
      
      protected var ImgCheckpointMarker:Class = PlayState_ImgCheckpointMarker;
      
      protected var ImgCheckpointRay:Class = PlayState_ImgCheckpointRay;
      
      protected var ImgCheckpointRayAnim:Class = PlayState_ImgCheckpointRayAnim;
      
      protected var ImgKeyboard:Class = PlayState_ImgKeyboard;
      
      protected var ImgTheEnd:Class = PlayState_ImgTheEnd;
      
      private var ImgSonicBoom:Class = PlayState_ImgSonicBoom;
      
      private var ImgPuff:Class = PlayState_ImgPuff;
      
      protected var ImgLevelCleared:Class = PlayState_ImgLevelCleared;
      
      protected var ImgIntersticial:Class = PlayState_ImgIntersticial;
      
      protected var ImgHighInt:Class = PlayState_ImgHighInt;
      
      protected var ImgHighIntOver:Class = PlayState_ImgHighIntOver;
      
      protected var ImgControls:Class = PlayState_ImgControls;
      
      protected var ImgDontGetCaught:Class = PlayState_ImgDontGetCaught;
      
      protected var ImgContinue:Class = PlayState_ImgContinue;
      
      protected var ImgContinueOver:Class = PlayState_ImgContinueOver;
      
      protected var ImgHudBg:Class = PlayState_ImgHudBg;
      
      protected var ImgGetIPhoneHL:Class = PlayState_ImgGetIPhoneHL;
      
      protected var ImgGetIPhone:Class = PlayState_ImgGetIPhone;
      
      protected var ImgPauseBut:Class = PlayState_ImgPauseBut;
      
      protected var ImgPauseButHL:Class = PlayState_ImgPauseButHL;
      
      public var ImgSoundButHL:Class = PlayState_ImgSoundButHL;
      
      public var ImgSoundBut:Class = PlayState_ImgSoundBut;
      
      public var ImgSoundButOnHL:Class = PlayState_ImgSoundButOnHL;
      
      public var ImgSoundButOn:Class = PlayState_ImgSoundButOn;
      
      protected var ImgEndButton:Class = PlayState_ImgEndButton;
      
      protected var ImgEndButtonOver:Class = PlayState_ImgEndButtonOver;
      
      protected var ImgNextButton:Class = PlayState_ImgNextButton;
      
      protected var ImgNextButtonOver:Class = PlayState_ImgNextButtonOver;
      
      protected var ImgMultiEnd:Class = PlayState_ImgMultiEnd;
      
      protected var Img1st:Class = PlayState_Img1st;
      
      protected var ImgResultBlue:Class = PlayState_ImgResultBlue;
      
      protected var ImgResultGreen:Class = PlayState_ImgResultGreen;
      
      protected var ImgResultYellow:Class = PlayState_ImgResultYellow;
      
      protected var ImgResultRed:Class = PlayState_ImgResultRed;
      
      protected var ImgResultBlueSmall:Class = PlayState_ImgResultBlueSmall;
      
      protected var ImgResultGreenSmall:Class = PlayState_ImgResultGreenSmall;
      
      protected var ImgResultYellowSmall:Class = PlayState_ImgResultYellowSmall;
      
      protected var ImgResultRedSmall:Class = PlayState_ImgResultRedSmall;
      
      protected var ImgResultNoneSmall:Class = PlayState_ImgResultNoneSmall;
      
      protected var ImgKeyQ:Class = PlayState_ImgKeyQ;
      
      protected var ImgKeyX:Class = PlayState_ImgKeyX;
      
      protected var ImgKeyP:Class = PlayState_ImgKeyP;
      
      protected var ImgKeyM:Class = PlayState_ImgKeyM;
      
      protected var ImgKeyboardQ:Class = PlayState_ImgKeyboardQ;
      
      protected var ImgKeyboardX:Class = PlayState_ImgKeyboardX;
      
      protected var ImgKeyboardP:Class = PlayState_ImgKeyboardP;
      
      protected var ImgKeyboardM:Class = PlayState_ImgKeyboardM;
      
      protected var ImgSun:Class = PlayState_ImgSun;
      
      protected var ImgBackground:Class = PlayState_ImgBackground;
      
      protected var ImgBackground1:Class = PlayState_ImgBackground1;
      
      protected var ImgBackground2:Class = PlayState_ImgBackground2;
      
      protected var ImgTopShipBig:Class = PlayState_ImgTopShipBig;
      
      protected var ImgTopShipSmall:Class = PlayState_ImgTopShipSmall;
      
      protected var ImgBackship:Class = PlayState_ImgBackship;
      
      protected var ImgcollisionBlock:Class = PlayState_ImgcollisionBlock;
      
      protected var ImgCheckpointAnimation:Class = PlayState_ImgCheckpointAnimation;
      
      protected var ImgCheckpointAnimationBlack:Class = PlayState_ImgCheckpointAnimationBlack;
      
      protected var ImgAcceleratorSingle:Class = PlayState_ImgAcceleratorSingle;
      
      protected var ImgblackTile:Class = PlayState_ImgblackTile;
      
      protected var ImgBlue02:Class = PlayState_ImgBlue02;
      
      protected var ImgBlue03:Class = PlayState_ImgBlue03;
      
      protected var ImgBlueDoorLight:Class = PlayState_ImgBlueDoorLight;
      
      protected var ImgBlueLightCube:Class = PlayState_ImgBlueLightCube;
      
      protected var ImgBlueLightCubeDark:Class = PlayState_ImgBlueLightCubeDark;
      
      protected var ImgBlueLightHolder:Class = PlayState_ImgBlueLightHolder;
      
      protected var ImgBlueLightHolderFront:Class = PlayState_ImgBlueLightHolderFront;
      
      protected var ImgBlueLightWall:Class = PlayState_ImgBlueLightWall;
      
      protected var ImgBlueSingle:Class = PlayState_ImgBlueSingle;
      
      protected var ImgBlueVerticalBottom:Class = PlayState_ImgBlueVerticalBottom;
      
      protected var ImgBlueVerticalMiddle:Class = PlayState_ImgBlueVerticalMiddle;
      
      protected var ImgBlueVerticalTop:Class = PlayState_ImgBlueVerticalTop;
      
      protected var ImgBridgeBY001:Class = PlayState_ImgBridgeBY001;
      
      protected var ImgBridgeBY002:Class = PlayState_ImgBridgeBY002;
      
      protected var ImgBridgeBY003:Class = PlayState_ImgBridgeBY003;
      
      protected var ImgBridgeBYCenterFRONT:Class = PlayState_ImgBridgeBYCenterFRONT;
      
      protected var ImgBridgeBYholder:Class = PlayState_ImgBridgeBYholder;
      
      protected var ImgBridgeBYLeftFRONT:Class = PlayState_ImgBridgeBYLeftFRONT;
      
      protected var ImgBridgeBYRightFRONT:Class = PlayState_ImgBridgeBYRightFRONT;
      
      protected var ImgBridgeCross001:Class = PlayState_ImgBridgeCross001;
      
      protected var ImgBridgeCross002:Class = PlayState_ImgBridgeCross002;
      
      protected var ImgBridgeCrossHolder:Class = PlayState_ImgBridgeCrossHolder;
      
      protected var ImgBridgeCrossSingle:Class = PlayState_ImgBridgeCrossSingle;
      
      protected var ImgBrownDoorLight:Class = PlayState_ImgBrownDoorLight;
      
      protected var ImgBuildingFullWallBlue:Class = PlayState_ImgBuildingFullWallBlue;
      
      protected var ImgBuildingFullWallBrown:Class = PlayState_ImgBuildingFullWallBrown;
      
      protected var ImgBuildingWallBlue001:Class = PlayState_ImgBuildingWallBlue001;
      
      protected var ImgBuildingWallBrown001:Class = PlayState_ImgBuildingWallBrown001;
      
      protected var ImgCheckpoint001:Class = PlayState_ImgCheckpoint001;
      
      protected var ImgCheckpoint002:Class = PlayState_ImgCheckpoint002;
      
      protected var ImgCheckpointBeamlight:Class = PlayState_ImgCheckpointBeamlight;
      
      protected var ImgCreamy01:Class = PlayState_ImgCreamy01;
      
      protected var ImgCreamy02:Class = PlayState_ImgCreamy02;
      
      protected var ImgCreamy03:Class = PlayState_ImgCreamy03;
      
      protected var ImgCreamySingle:Class = PlayState_ImgCreamySingle;
      
      protected var ImgCreamyWallBottom:Class = PlayState_ImgCreamyWallBottom;
      
      protected var ImgCreamyWallTop:Class = PlayState_ImgCreamyWallTop;
      
      protected var ImgDarkBridge001:Class = PlayState_ImgDarkBridge001;
      
      protected var ImgDarkBridge002:Class = PlayState_ImgDarkBridge002;
      
      protected var ImgDarkBridgeHolder:Class = PlayState_ImgDarkBridgeHolder;
      
      protected var ImgDarkBridgeSingle:Class = PlayState_ImgDarkBridgeSingle;
      
      protected var ImgDarkGlassMiddleLeft:Class = PlayState_ImgDarkGlassMiddleLeft;
      
      protected var ImgDarkGlassMiddleRight:Class = PlayState_ImgDarkGlassMiddleRight;
      
      protected var ImgDarkGlassTunnelHolder:Class = PlayState_ImgDarkGlassTunnelHolder;
      
      protected var ImgDarkPipe001png:Class = PlayState_ImgDarkPipe001png;
      
      protected var ImgDarkPipeTop:Class = PlayState_ImgDarkPipeTop;
      
      protected var ImgDarkWallBottom:Class = PlayState_ImgDarkWallBottom;
      
      protected var ImgDarkWallLight01:Class = PlayState_ImgDarkWallLight01;
      
      protected var ImgDarkWallLight02:Class = PlayState_ImgDarkWallLight02;
      
      protected var ImgDarkWallLight03:Class = PlayState_ImgDarkWallLight03;
      
      protected var ImgDarkWallLight04:Class = PlayState_ImgDarkWallLight04;
      
      protected var ImgDarkWallTop:Class = PlayState_ImgDarkWallTop;
      
      protected var ImgDoubleDarkGlassBottom:Class = PlayState_ImgDoubleDarkGlassBottom;
      
      protected var ImgDoubleDarkGlassBottomSingle:Class = PlayState_ImgDoubleDarkGlassBottomSingle;
      
      protected var ImgDoubleDarkGlassFrontBottom:Class = PlayState_ImgDoubleDarkGlassFrontBottom;
      
      protected var ImgDoubleDarkGlassFrontMiddle:Class = PlayState_ImgDoubleDarkGlassFrontMiddle;
      
      protected var ImgDoubleDarkGlassSimpleBottom:Class = PlayState_ImgDoubleDarkGlassSimpleBottom;
      
      protected var ImgDoubleDarkGlassTop:Class = PlayState_ImgDoubleDarkGlassTop;
      
      protected var ImgDoubleDarkGlassTopSingle:Class = PlayState_ImgDoubleDarkGlassTopSingle;
      
      protected var ImgDoubleGlassBottom:Class = PlayState_ImgDoubleGlassBottom;
      
      protected var ImgDoubleGlassBottomSimple:Class = PlayState_ImgDoubleGlassBottomSimple;
      
      protected var ImgDoubleGlassBottomSingle:Class = PlayState_ImgDoubleGlassBottomSingle;
      
      protected var ImgDoubleGlassTop:Class = PlayState_ImgDoubleGlassTop;
      
      protected var ImgDoubleGlassTopSingle:Class = PlayState_ImgDoubleGlassTopSingle;
      
      protected var ImgFinalTunnel:Class = PlayState_ImgFinalTunnel;
      
      protected var ImgFinalTunnelFront:Class = PlayState_ImgFinalTunnelFront;
      
      protected var ImgFinalTunnelWindow:Class = PlayState_ImgFinalTunnelWindow;
      
      protected var ImgGlassTunnelBottom:Class = PlayState_ImgGlassTunnelBottom;
      
      protected var ImgGlassTunnelBottomFront:Class = PlayState_ImgGlassTunnelBottomFront;
      
      protected var ImgGlassTunnelBottomSingle:Class = PlayState_ImgGlassTunnelBottomSingle;
      
      protected var ImgGlassTunnelExtraBottom:Class = PlayState_ImgGlassTunnelExtraBottom;
      
      protected var ImgGlassTunnelExtraTop:Class = PlayState_ImgGlassTunnelExtraTop;
      
      protected var ImgGlassTunnelHolder:Class = PlayState_ImgGlassTunnelHolder;
      
      protected var ImgGlassTunnelMiddle:Class = PlayState_ImgGlassTunnelMiddle;
      
      protected var ImgGlassTunnelMiddleFront:Class = PlayState_ImgGlassTunnelMiddleFront;
      
      protected var ImgGlassTunnelMiddleHolderLeft:Class = PlayState_ImgGlassTunnelMiddleHolderLeft;
      
      protected var ImgGlassTunnelMiddleHolderRight:Class = PlayState_ImgGlassTunnelMiddleHolderRight;
      
      protected var ImgGlassTunnelSingle:Class = PlayState_ImgGlassTunnelSingle;
      
      protected var ImgGlassTunnelSingleBottom:Class = PlayState_ImgGlassTunnelSingleBottom;
      
      protected var ImgGlassTunnelSingleBottomFront:Class = PlayState_ImgGlassTunnelSingleBottomFront;
      
      protected var ImgGlassTunnelSingleMiddle:Class = PlayState_ImgGlassTunnelSingleMiddle;
      
      protected var ImgGlassTunnelSingleMiddleFront:Class = PlayState_ImgGlassTunnelSingleMiddleFront;
      
      protected var ImgGlassTunnelSingleTop:Class = PlayState_ImgGlassTunnelSingleTop;
      
      protected var ImgGlassTunnelTop:Class = PlayState_ImgGlassTunnelTop;
      
      protected var ImgGreenLightCube:Class = PlayState_ImgGreenLightCube;
      
      protected var ImgGrey02:Class = PlayState_ImgGrey02;
      
      protected var ImgGrey03:Class = PlayState_ImgGrey03;
      
      protected var ImgGreyHolder:Class = PlayState_ImgGreyHolder;
      
      protected var ImgGreyHolderFront:Class = PlayState_ImgGreyHolderFront;
      
      protected var ImgGreyHolderLight:Class = PlayState_ImgGreyHolderLight;
      
      protected var ImgGreySingle:Class = PlayState_ImgGreySingle;
      
      protected var ImgGreySingleLight:Class = PlayState_ImgGreySingleLight;
      
      protected var ImgGreyVerticalBottom:Class = PlayState_ImgGreyVerticalBottom;
      
      protected var ImgGreyVerticalMiddle:Class = PlayState_ImgGreyVerticalMiddle;
      
      protected var ImgGreyVerticalTop:Class = PlayState_ImgGreyVerticalTop;
      
      protected var ImgLight01:Class = PlayState_ImgLight01;
      
      protected var ImgLight02:Class = PlayState_ImgLight02;
      
      protected var ImgLight03:Class = PlayState_ImgLight03;
      
      protected var ImgLight04:Class = PlayState_ImgLight04;
      
      protected var ImgLight05:Class = PlayState_ImgLight05;
      
      protected var ImgLight06:Class = PlayState_ImgLight06;
      
      protected var ImgLight07:Class = PlayState_ImgLight07;
      
      protected var ImgLight08:Class = PlayState_ImgLight08;
      
      protected var ImgLight09:Class = PlayState_ImgLight09;
      
      protected var ImgLightCubeBrown:Class = PlayState_ImgLightCubeBrown;
      
      protected var ImgLightCubeGray:Class = PlayState_ImgLightCubeGray;
      
      protected var ImgOrange02grey:Class = PlayState_ImgOrange02grey;
      
      protected var ImgOrange02light:Class = PlayState_ImgOrange02light;
      
      protected var ImgOrange03:Class = PlayState_ImgOrange03;
      
      protected var ImgOrange03grey:Class = PlayState_ImgOrange03grey;
      
      protected var ImgOrange03Light:Class = PlayState_ImgOrange03Light;
      
      protected var ImgOrangeHolder:Class = PlayState_ImgOrangeHolder;
      
      protected var ImgOrangeHolderFront:Class = PlayState_ImgOrangeHolderFront;
      
      protected var ImgOrangeLight01:Class = PlayState_ImgOrangeLight01;
      
      protected var ImgOrangeLight02:Class = PlayState_ImgOrangeLight02;
      
      protected var ImgOrangeLight03:Class = PlayState_ImgOrangeLight03;
      
      protected var ImgOrangeLight04:Class = PlayState_ImgOrangeLight04;
      
      protected var ImgOrangeLightWallBottom:Class = PlayState_ImgOrangeLightWallBottom;
      
      protected var ImgOrangeLightWallTop:Class = PlayState_ImgOrangeLightWallTop;
      
      protected var ImgOrangePipe:Class = PlayState_ImgOrangePipe;
      
      protected var ImgOrangePipeTop:Class = PlayState_ImgOrangePipeTop;
      
      protected var ImgOrangeSingle:Class = PlayState_ImgOrangeSingle;
      
      protected var ImgOrangeSingle02:Class = PlayState_ImgOrangeSingle02;
      
      protected var ImgOrangeSingleLight:Class = PlayState_ImgOrangeSingleLight;
      
      protected var ImgOrangeVerticalBottom:Class = PlayState_ImgOrangeVerticalBottom;
      
      protected var ImgOrangeVerticalBottom02:Class = PlayState_ImgOrangeVerticalBottom02;
      
      protected var ImgOrangeVerticalBottom02Light:Class = PlayState_ImgOrangeVerticalBottom02Light;
      
      protected var ImgOrangeVerticalMiddle:Class = PlayState_ImgOrangeVerticalMiddle;
      
      protected var ImgOrangeVerticalMiddle02:Class = PlayState_ImgOrangeVerticalMiddle02;
      
      protected var ImgOrangeVerticalMiddleLight:Class = PlayState_ImgOrangeVerticalMiddleLight;
      
      protected var ImgOrangeVerticalTop:Class = PlayState_ImgOrangeVerticalTop;
      
      protected var ImgOrangeVerticalTop02:Class = PlayState_ImgOrangeVerticalTop02;
      
      protected var ImgOrangeVerticalTopLight:Class = PlayState_ImgOrangeVerticalTopLight;
      
      protected var ImgRedPipe001png:Class = PlayState_ImgRedPipe001png;
      
      protected var ImgRedPipeTop:Class = PlayState_ImgRedPipeTop;
      
      protected var Imgshadow:Class = PlayState_Imgshadow;
      
      protected var ImgshadowLeft:Class = PlayState_ImgshadowLeft;
      
      protected var Imgshadowright:Class = PlayState_Imgshadowright;
      
      protected var ImgSHADOWUNIY:Class = PlayState_ImgSHADOWUNIY;
      
      protected var ImgsmallShadow:Class = PlayState_ImgsmallShadow;
      
      protected var ImgTOMALAQUEJAALMOCASTE:Class = PlayState_ImgTOMALAQUEJAALMOCASTE;
      
      protected var ImgwhiteBG:Class = PlayState_ImgwhiteBG;
      
      protected var ImgYellow02:Class = PlayState_ImgYellow02;
      
      protected var ImgYellow03:Class = PlayState_ImgYellow03;
      
      protected var ImgYellowSingle:Class = PlayState_ImgYellowSingle;
      
      protected var ImgYellowVerticalBottom:Class = PlayState_ImgYellowVerticalBottom;
      
      protected var ImgYellowVerticalMiddle:Class = PlayState_ImgYellowVerticalMiddle;
      
      protected var ImgYellowVerticalTop:Class = PlayState_ImgYellowVerticalTop;
      
      protected var Img000:Class = PlayState_Img000;
      
      protected var Img001:Class = PlayState_Img001;
      
      protected var Img002:Class = PlayState_Img002;
      
      protected var Img003:Class = PlayState_Img003;
      
      protected var Img004:Class = PlayState_Img004;
      
      protected var Imgcredits_andrew:Class = PlayState_Imgcredits_andrew;
      
      protected var Imgcredits_antonio2:Class = PlayState_Imgcredits_antonio2;
      
      protected var Imgcredits_copyright:Class = PlayState_Imgcredits_copyright;
      
      protected var Imgcredits_DON_NUNO:Class = PlayState_Imgcredits_DON_NUNO;
      
      protected var Imgcredits_graphics:Class = PlayState_Imgcredits_graphics;
      
      protected var Imgcredits_Joana:Class = PlayState_Imgcredits_Joana;
      
      protected var Imgcredits_level_design:Class = PlayState_Imgcredits_level_design;
      
      protected var Imgcredits_mikael:Class = PlayState_Imgcredits_mikael;
      
      protected var Imgcredits_miniclip:Class = PlayState_Imgcredits_miniclip;
      
      protected var Imgcredits_NunoMonteiro:Class = PlayState_Imgcredits_NunoMonteiro;
      
      protected var Imgcredits_olesja:Class = PlayState_Imgcredits_olesja;
      
      protected var Imgcredits_programming:Class = PlayState_Imgcredits_programming;
      
      protected var Imgcredits_sounds:Class = PlayState_Imgcredits_sounds;
      
      protected var Imgcredits_special_thanx:Class = PlayState_Imgcredits_special_thanx;
      
      protected var Imgcredits_vasco:Class = PlayState_Imgcredits_vasco;
      
      protected var ImggilsusWalks:Class = PlayState_ImggilsusWalks;
      
      protected var Imgvasco:Class = PlayState_Imgvasco;
      
      protected var ImgVitorMarques:Class = PlayState_ImgVitorMarques;
      
      protected var ImgCRLightCubeGray:Class = PlayState_ImgCRLightCubeGray;
      
      private var _showEndingCredits:uint = 0;
      
      protected var _screenshotChangeTime:Number = 1;
      
      public var slideLoop:FlxSound;
      
      protected var sonicBoomLoop:FlxSound;
      
      protected var accelLoop:FlxSound;
      
      protected var playingAccelLoop:Number = 0;
      
      protected var debugMode:Boolean = false;
      
      protected var startSpeed:Number = 220;
      
      protected var interCountdown:Number = -1;
      
      protected var interCountdownText:FlxText;
      
      private var _bPause:FlxButton;
      
      private var _bMenu:FlxButton;
      
      private var _bResume:FlxButton;
      
      private var _bGetIPhone:FlxButton;
      
      private var _bSubmitScore:FlxButton;
      
      private var _bMiniclip:FlxButton;
      
      protected var _nextButton:FlxButton;
      
      protected var _endButton:FlxButton;
      
      private var flashButton:Number = 0;
      
      private var _bSound:FlxButton;
      
      protected var _blocks:FlxGroup;
      
      protected var _decorations:FlxGroup;
      
      protected var _decorationsFront:FlxGroup;
      
      protected var _overlapAreas:FlxGroup;
      
      protected var _players:FlxGroup;
      
      protected var _checkpointPositions:Array;
      
      protected var _decors:Array;
      
      protected var _player:Player;
      
      protected var _enemy:Enemy;
      
      public var _camera:FlxSprite;
      
      protected var _theEnd:FlxSprite;
      
      protected var _theEndScore:FlxText;
      
      protected var _keyboard:FlxSprite;
      
      protected var _keyboardQ:FlxSprite;
      
      protected var _keyboardX:FlxSprite;
      
      protected var _keyboardP:FlxSprite;
      
      protected var _keyboardM:FlxSprite;
      
      protected var _keyQ:FlxSprite;
      
      protected var _keyX:FlxSprite;
      
      protected var _keyP:FlxSprite;
      
      protected var _keyM:FlxSprite;
      
      protected var _intersticial:FlxSprite;
      
      protected var _continueInt:FlxSprite;
      
      protected var _continueIntOver:FlxSprite;
      
      protected var _highInt:FlxSprite;
      
      protected var _highIntOver:FlxSprite;
      
      protected var _screenshot2:FlxSprite;
      
      protected var _screenshot3:FlxSprite;
      
      protected var _getItNowOn:FlxSprite;
      
      protected var _getItNowOn2:FlxSprite;
      
      protected var _getItNowOff:FlxSprite;
      
      protected var _getItButton:FlxButton;
      
      protected var _continueIntButton:FlxButton;
      
      protected var _highIntButton:FlxButton;
      
      protected var _controls:FlxSprite;
      
      protected var _dontGetCaught:FlxSprite;
      
      protected var _continueButton:FlxButton;
      
      protected var _endContinueButton:FlxButton;
      
      protected var _multiEnd:FlxSprite;
      
      protected var _1stPlace:FlxSprite;
      
      protected var _2ndPlace:FlxSprite;
      
      protected var _3rdPlace:FlxSprite;
      
      protected var _4thPlace:FlxSprite;
      
      protected var _1st:FlxSprite;
      
      protected var _wins1:FlxText;
      
      protected var _wins2:FlxText;
      
      protected var _wins3:FlxText;
      
      protected var _wins4:FlxText;
      
      protected var _pressEnterToStart:FlxText;
      
      protected var _raceResultBlue:FlxSprite;
      
      protected var _raceResultGreen:FlxSprite;
      
      protected var _raceResultRed:FlxSprite;
      
      protected var _raceResultYellow:FlxSprite;
      
      protected var _raceResultBlueSmall:FlxSprite;
      
      protected var _raceResultGreenSmall:FlxSprite;
      
      protected var _raceResultRedSmall:FlxSprite;
      
      protected var _raceResultYellowSmall:FlxSprite;
      
      protected var _raceResultNoneSmall:FlxSprite;
      
      protected var hudBg:FlxSprite;
      
      protected var getIPhoneHL:FlxSprite;
      
      protected var pauseButHL:FlxSprite;
      
      protected var soundOn:FlxSprite;
      
      protected var cameraSpeedOnDeath:Number;
      
      protected var Sun:FlxSprite;
      
      protected var background:FlxSprite;
      
      protected var background1:FlxSprite;
      
      protected var background1_2:FlxSprite;
      
      protected var background1_3:FlxSprite;
      
      protected var background2:FlxSprite;
      
      protected var background2_2:FlxSprite;
      
      protected var background2_3:FlxSprite;
      
      protected var bgShipBig:FlxSprite;
      
      protected var bgShipBig_2:FlxSprite;
      
      protected var bgShipSmall:FlxSprite;
      
      protected var bgShipSmall_2:FlxSprite;
      
      protected var bgBackship:FlxSprite;
      
      protected var bgBackship_2:FlxSprite;
      
      protected var bgBackship_3:FlxSprite;
      
      public var sonicBoom:FlxSprite;
      
      public var puffs:FlxGroup;
      
      protected var _objects:FlxGroup;
      
      protected var _enemies:FlxGroup;
      
      protected var _firstLiveBlock:int = 0;
      
      protected var _dontUpdateLiveBlock:Boolean = false;
      
      protected var _firstLiveDecoration:int = 0;
      
      protected var _dontUpdateLiveDecoration:Boolean = false;
      
      protected var _firstLiveDecorationFront:int = 0;
      
      protected var _dontUpdateLiveDecorationFront:Boolean = false;
      
      protected var _firstLiveOverlapArea:int = 0;
      
      protected var _dontUpdateLiveOverlapArea:Boolean = false;
      
      protected var f:int = 0;
      
      protected var _score:FlxText;
      
      protected var _scoreTimer:Number;
      
      protected var _levelCleared:FlxSprite;
      
      protected var _timeBonusText:FlxText;
      
      protected var backgroundSecs:Array;
      
      protected var _fading:Boolean;
      
      public var reload:Boolean;
      
      protected var nextBackgroundSec:uint = 0;
      
      public var nextCheckpoint:uint = 1;
      
      public var checkpointDistance:uint;
      
      public var distanceScore:int = 0;
      
      public var timeInCheckpoint:Number = 0;
      
      public var prevCheckpointX:Number = 0;
      
      public var levelClearedTime:Number = 0;
      
      public var levelClearedTimeMax:Number = 2.3;
      
      public var timeBonusTime:Number = 0;
      
      public var timeBonusTimeMax:Number = 3;
      
      private var agi:*;
      
      public function PlayState()
      {
         super();
      }
      
      override public function create() : void
      {
         var _loc1_:int = 0;
         var _loc2_:FlxObject = null;
         var _loc3_:FlxSprite = null;
         var _loc4_:OverlapArea = null;
         var _loc7_:ByteArray = null;
         var _loc8_:String = null;
         var _loc9_:XML = null;
         var _loc29_:XML = null;
         super.update();
         FlxG.submittingScore = false;
         FlxG.timeScale = 1;
         FlxG.inPlayState = true;
         this._checkpointPositions = new Array();
         this.reload = false;
         FlxG.timeToReload = 999;
         FlxG.showIntersticial = false;
         FlxG.ending = -1;
         this.accelLoop = new FlxSound();
         this.accelLoop.loadEmbedded(SndAccelLoop,true);
         this.accelLoop.volume = 0.7;
         this.slideLoop = new FlxSound();
         this.slideLoop.loadEmbedded(SndSlide,true);
         this.sonicBoomLoop = new FlxSound();
         this.sonicBoomLoop.loadEmbedded(SndSonicBoomLoop,true);
         if(checkpointSave.bind("flixel") && checkpointSave.data.checkpointX != null)
         {
            if(checkpointSave.data.checkpointX > 800)
            {
               FlxG.checkpointX = checkpointSave.data.checkpointX;
               FlxG.checkpointY = checkpointSave.data.checkpointY;
               if(checkpointSave.data.timeInCheckpoint)
               {
                  this.timeInCheckpoint = checkpointSave.data.timeInCheckpoint;
               }
               if(checkpointSave.data.score)
               {
                  FlxG.score = checkpointSave.data.score;
               }
            }
         }
         this.distanceScore = 0;
         this.backgroundSecs = new Array();
         puffIndex = 0;
         this.puffs = new FlxGroup();
         this.cameraSpeedOnDeath = 0;
         if(FlxG.numPlayers == 1 && !FlxG.credits)
         {
            this.backgroundSecs.push(6029);
            this.backgroundSecs.push(6490);
            this.backgroundSecs.push(21927);
            this.backgroundSecs.push(22559);
            this.backgroundSecs.push(47129);
            this.backgroundSecs.push(48603);
            this.backgroundSecs.push(60512);
            this.backgroundSecs.push(62347);
            this.backgroundSecs.push(71022);
            this.backgroundSecs.push(71168);
            this.backgroundSecs.push(77227);
            this.backgroundSecs.push(77776);
            this.backgroundSecs.push(87799);
            this.backgroundSecs.push(88637);
         }
         this._bPause = new FlxButton(0,0,this.onPause);
         this._bPause.loadGraphic(new FlxSprite(0,0,this.ImgPauseBut),new FlxSprite(0,0,this.ImgPauseButHL));
         this._bPause.scrollFactor.x = 0;
         this._bPause.scrollFactor.y = 0;
         this._bSubmitScore = new FlxButton(520,28,this.onSubmitScore);
         this._bSubmitScore.loadGraphic(new FlxSprite(0,0,ImgSubmitScore),new FlxSprite(0,0,ImgSubmitScoreHL));
         this._bSubmitScore.scrollFactor.x = 0;
         this._bSubmitScore.scrollFactor.y = 0;
         this._bSound = new FlxButton(58,0,this.onSound);
         this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundButOn),new FlxSprite(0,0,this.ImgSoundButOnHL));
         this._bSound.scrollFactor.x = 0;
         this._bSound.scrollFactor.y = 0;
         this._bGetIPhone = new FlxButton(70 + 42,0,this.onGetIPhone);
         this._bGetIPhone.loadGraphic(new FlxSprite(-41,0,this.ImgGetIPhone),new FlxSprite(-41,0,this.ImgGetIPhoneHL));
         this._bGetIPhone.scrollFactor.x = 0;
         this._bGetIPhone.scrollFactor.y = 0;
         if(FlxG.mute)
         {
            this._bSound.loadGraphic(new FlxSprite(0,0,this.ImgSoundBut),new FlxSprite(0,0,this.ImgSoundButHL));
         }
         this._blocks = new FlxGroup();
         this._decorations = new FlxGroup();
         this._decorationsFront = new FlxGroup();
         this._overlapAreas = new FlxGroup();
         this._players = new FlxGroup();
         this._enemies = new FlxGroup();
         this._decors = new Array();
         FlxG.enemySwitch.length = 0;
         FlxG.enemySpawnX = FlxG.checkpointX - 25;
         FlxG.enemySpawnY = FlxG.checkpointY;
         FlxG.enemySpawnSpeed = this.startSpeed;
         FlxG.tutorial = false;
         if(FlxG.numPlayers == 1)
         {
            this._player = new Player(FlxG.checkpointX - 25,FlxG.checkpointY,this.startSpeed);
            this.sonicBoom = new FlxSprite(-100,-100,this.ImgSonicBoom);
            this.sonicBoom.visible = false;
            this.sonicBoomLoop.stop();
            if(this._player.x < 2000 && !FlxG.credits)
            {
               FlxG.tutorial = true;
            }
         }
         else
         {
            this._multiEnd = new FlxSprite(0,0,this.ImgMultiEnd);
            this._multiEnd.scrollFactor.x = 0;
            this._multiEnd.scrollFactor.y = 0;
            this._multiEnd.visible = false;
            Player.currentStanding = FlxG.numPlayers;
            ++FlxG.round;
            if(FlxG.round > 6)
            {
               FlxG.round = 1;
            }
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               if(_loc1_ == 0)
               {
                  this._players.add(new Player(316,103,211.6983,0,_loc1_ + 1,p1wins));
               }
               if(_loc1_ == 1)
               {
                  this._players.add(new Player(316,325,211.6983,0,_loc1_ + 1,p2wins));
                  this._players.members[_loc1_].SwitchGravity();
               }
               if(_loc1_ == 2)
               {
                  this._players.add(new Player(316,240,211.6983,0,_loc1_ + 1,p3wins));
               }
               if(_loc1_ == 3)
               {
                  this._players.add(new Player(316,188,211.6983,0,_loc1_ + 1,p4wins));
                  this._players.members[_loc1_].SwitchGravity();
               }
               _loc1_++;
            }
            this._player = new Player(300,100,211.6983);
         }
         _loc1_ = 0;
         while(_loc1_ < FlxG.numPlayers * 3 + 3)
         {
            this.puffs.add(new FlxSprite(0,0));
            this.puffs.members[_loc1_].loadGraphic(this.ImgPuff,true,true,128,128);
            this.puffs.members[_loc1_].addAnimation("puff",[0,1,2,3,4,5],18,false);
            this.puffs.members[_loc1_].exists = false;
            _loc1_++;
         }
         if(FlxG.numPlayers == 1)
         {
            this._camera = new FlxSprite(FlxG.checkpointX + 17,240,this.ImgOrangeLight04);
         }
         else
         {
            this._camera = new FlxSprite(316,240);
         }
         _loc1_ = 0;
         while(_loc1_ < this.backgroundSecs.length)
         {
            if(this.backgroundSecs[_loc1_] > this._camera.x)
            {
               this.nextBackgroundSec = _loc1_;
               break;
            }
            _loc1_++;
         }
         this._blocks.cull = true;
         this._decorations.cull = true;
         this._decorationsFront.cull = true;
         var _loc5_:uint = 0;
         var _loc6_:Number = 0;
         this.background = new FlxSprite(0,0 + 59,this.ImgBackground);
         this.background.scrollFactor.x = 0;
         this.background.scrollFactor.y = 0;
         this.background1 = new FlxSprite(0,195 + 59,this.ImgBackground1);
         this.background1.scrollFactor.x = 0;
         this.background1.scrollFactor.y = 0;
         this.background1_2 = new FlxSprite(427,195 + 59,this.ImgBackground1);
         this.background1_2.scrollFactor.x = 0;
         this.background1_2.scrollFactor.y = 0;
         this.background1_3 = new FlxSprite(854,195 + 59,this.ImgBackground1);
         this.background1_3.scrollFactor.x = 0;
         this.background1_3.scrollFactor.y = 0;
         this.background2 = new FlxSprite(0,205 + 59,this.ImgBackground2);
         this.background2.scrollFactor.x = 0;
         this.background2.scrollFactor.y = 0;
         this.background2_2 = new FlxSprite(444,205 + 59,this.ImgBackground2);
         this.background2_2.scrollFactor.x = 0;
         this.background2_2.scrollFactor.y = 0;
         this.background2_3 = new FlxSprite(888,205 + 59,this.ImgBackground2);
         this.background2_3.scrollFactor.x = 0;
         this.background2_3.scrollFactor.y = 0;
         this.bgShipBig = new FlxSprite(0,0 + 59,this.ImgTopShipBig);
         this.bgShipBig.scrollFactor.x = 0;
         this.bgShipBig.scrollFactor.y = 0;
         this.bgShipBig_2 = new FlxSprite(580,0 + 59,this.ImgTopShipBig);
         this.bgShipBig_2.scrollFactor.x = 0;
         this.bgShipBig_2.scrollFactor.y = 0;
         this.bgShipSmall = new FlxSprite(426,0 + 59,this.ImgTopShipSmall);
         this.bgShipSmall.scrollFactor.x = 0;
         this.bgShipSmall.scrollFactor.y = 0;
         this.bgShipSmall_2 = new FlxSprite(1006,0 + 59,this.ImgTopShipSmall);
         this.bgShipSmall_2.scrollFactor.x = 0;
         this.bgShipSmall_2.scrollFactor.y = 0;
         this.bgBackship = new FlxSprite(0,0 + 59,this.ImgBackship);
         this.bgBackship.scrollFactor.x = 0;
         this.bgBackship.scrollFactor.y = 0;
         this.bgBackship_2 = new FlxSprite(350,0 + 59,this.ImgBackship);
         this.bgBackship_2.scrollFactor.x = 0;
         this.bgBackship_2.scrollFactor.y = 0;
         this.bgBackship_3 = new FlxSprite(700,0 + 59,this.ImgBackship);
         this.bgBackship_3.scrollFactor.x = 0;
         this.bgBackship_3.scrollFactor.y = 0;
         add(this.background);
         this.Sun = new FlxSprite(39,207 + 59,this.ImgSun);
         this.Sun.scrollFactor.x = 0;
         this.Sun.scrollFactor.y = 0;
         var _loc10_:uint = 0;
         var _loc11_:int = 5;
         if(FlxG.numPlayers > 1)
         {
            _loc11_ = 1;
            this._keyboard = new FlxSprite(0,408,this.ImgKeyboard);
            this._keyboard.scrollFactor.x = 0;
            this._keyboard.scrollFactor.y = 0;
            this._keyX = new FlxSprite(0,0,this.ImgKeyX);
            this._keyM = new FlxSprite(0,0,this.ImgKeyM);
            if(FlxG.numPlayers >= 3)
            {
               this._keyP = new FlxSprite(0,0,this.ImgKeyP);
            }
            if(FlxG.numPlayers >= 4)
            {
               this._keyQ = new FlxSprite(0,0,this.ImgKeyQ);
            }
            this._keyboardX = new FlxSprite(45,454,this.ImgKeyboardX);
            this._keyboardX.scrollFactor.x = 0;
            this._keyboardX.scrollFactor.y = 0;
            this._keyboardM = new FlxSprite(143,458,this.ImgKeyboardM);
            this._keyboardM.scrollFactor.x = 0;
            this._keyboardM.scrollFactor.y = 0;
            if(FlxG.numPlayers >= 3)
            {
               this._keyboardP = new FlxSprite(185,422,this.ImgKeyboardP);
               this._keyboardP.scrollFactor.x = 0;
               this._keyboardP.scrollFactor.y = 0;
            }
            if(FlxG.numPlayers >= 4)
            {
               this._keyboardQ = new FlxSprite(23,422,this.ImgKeyboardQ);
               this._keyboardQ.scrollFactor.x = 0;
               this._keyboardQ.scrollFactor.y = 0;
            }
         }
         _loc1_ = 1;
         while(_loc1_ <= _loc11_)
         {
            if(FlxG.credits)
            {
               _loc7_ = new creditsplist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
               this._player.x = 316 - 25;
               this._player.y = 270;
               this._camera.x = 316 + 17;
            }
            else if(FlxG.numPlayers > 1)
            {
               if(FlxG.round == 1 || FlxG.round == 4)
               {
                  _loc7_ = new mp02plist();
               }
               if(FlxG.round == 2 || FlxG.round == 5)
               {
                  _loc7_ = new mp03plist();
               }
               if(FlxG.round == 3 || FlxG.round == 6)
               {
                  _loc7_ = new mp04plist();
               }
               this._camera.velocity.x = 0;
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 1)
            {
               _loc7_ = new sp1plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 2)
            {
               _loc10_ = 28288;
               _loc7_ = new sp2plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 3)
            {
               _loc10_ = 53754;
               _loc7_ = new sp3plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 4)
            {
               _loc10_ = 81430;
               _loc7_ = new sp4plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 5)
            {
               _loc10_ = 107406;
               _loc7_ = new sp5plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 6)
            {
               _loc10_ = 128146;
               _loc7_ = new sp6plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            else if(_loc1_ == 7)
            {
               _loc10_ = 160106;
               _loc7_ = new sp7plist();
               _loc8_ = _loc7_.readUTFBytes(_loc7_.length);
               _loc9_ = new XML(_loc8_);
            }
            for each(_loc29_ in _loc9_.dict.array[0].dict)
            {
               if(_loc29_.integer == "1")
               {
                  _loc2_ = new FlxObject(int(_loc29_.real[0]) * 34 + _loc10_,425 - int(_loc29_.real[1]) * 34,34,34);
                  _loc2_.fixed = true;
                  this._blocks.add(_loc2_);
               }
               if(_loc29_.integer == "2")
               {
                  _loc2_ = new FlxObject(int(_loc29_.real[0]) * 34 + _loc10_,425 - int(_loc29_.real[1]) * 34,34,34);
                  _loc2_.fixed = true;
                  this._blocks.add(_loc2_);
                  _loc4_ = new OverlapArea(_loc2_.x,_loc2_.y - 1,34,1,2);
                  this._overlapAreas.add(_loc4_);
                  _loc4_ = new OverlapArea(_loc2_.x,_loc2_.y + 34,34,1,2);
                  this._overlapAreas.add(_loc4_);
               }
               if(_loc29_.integer == "3")
               {
                  _loc2_ = new FlxObject(int(_loc29_.real[0]) * 34 + _loc10_,425 - int(_loc29_.real[1]) * 34,34,34);
                  _loc2_.fixed = true;
                  _loc2_.health = _loc6_ = Number(_loc29_.real[2]) * 0.64151;
                  if(_loc2_.health <= 10)
                  {
                     _loc2_.health = 50;
                  }
                  this._blocks.add(_loc2_);
                  _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 34 + _loc10_,425 - int(_loc29_.real[1]) * 34);
                  _loc3_.loadGraphic(this.ImgEmptyTile,true,false,34,34);
                  _loc3_.health = -30;
                  this._decorations.add(_loc3_);
               }
               if(_loc29_.integer == "4")
               {
                  _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 34 + _loc10_,425 - int(_loc29_.real[1]) * 34,this.ImgCheckpointRay);
                  _loc3_.health = -40;
                  _loc4_ = new OverlapArea(_loc3_.x,425 - int(_loc29_.real[1]) * 34,34,34,4,_loc6_);
                  this._overlapAreas.add(_loc4_);
                  _loc4_ = new OverlapArea(_loc3_.x,425 - int(_loc29_.real[1]) * 34,34,34,5,_loc6_);
                  this._overlapAreas.add(_loc4_);
               }
            }
            for each(_loc29_ in _loc9_.dict.array[1].dict)
            {
               if(_loc29_.string == "accelerator")
               {
                  _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 0.641509 + _loc10_,425 - int(_loc29_.real[1]) * 0.641509 + 36);
                  _loc3_.loadGraphic(this.ImgSpeed,true,false,47,39);
                  _loc3_.addAnimation("default",[0,1,2,3,4,5,6],20);
                  _loc3_.play("default");
                  _loc3_.depth = _loc29_.integer;
                  this._decorations.add(_loc3_);
               }
               if(!(_loc29_.string == "accelerator" || _loc29_.string == "checkpoint" || _loc29_.string == "AcceleratorSingleLight_"))
               {
                  if(!(FlxG.credits && _loc29_.string == "collisionBlock"))
                  {
                     _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 0.641509 + _loc10_,425 - int(_loc29_.real[1]) * 0.641509 + 36);
                     _loc3_.loadGraphic(this["Img" + _loc29_.string] as Class);
                     _loc3_.depth = _loc29_.integer;
                     if(_loc29_.key[4] == "scaleX")
                     {
                        _loc3_.scale.x = Number(_loc29_.real[2]);
                        _loc3_.x += _loc3_.width * 0.5 * _loc3_.scale.x - _loc3_.width * 0.5;
                     }
                     if(_loc29_.key[4] == "scaleY")
                     {
                        _loc3_.scale.y = Number(_loc29_.real[2]);
                        _loc3_.y += _loc3_.height * 0.5 * _loc3_.scale.y - _loc3_.height * 0.5;
                     }
                     if(_loc29_.key[5] == "scaleX")
                     {
                        _loc3_.scale.x = Number(_loc29_.real[3]);
                        _loc3_.x += _loc3_.width * 0.5 * _loc3_.scale.x - _loc3_.width * 0.5;
                     }
                     if(_loc29_.key[5] == "scaleY")
                     {
                        _loc3_.scale.y = Number(_loc29_.real[3]);
                        _loc3_.y += _loc3_.height * 0.5 * _loc3_.scale.y - _loc3_.height * 0.5;
                     }
                     this._decorations.add(_loc3_);
                  }
               }
            }
            for each(_loc29_ in _loc9_.dict.array[3].dict)
            {
               if(_loc29_.string == "accelerator")
               {
                  _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 0.641509 + _loc10_,425 - int(_loc29_.real[1]) * 0.641509 + 36);
                  _loc3_.loadGraphic(this.ImgSpeed,true,false,47,39);
                  _loc3_.addAnimation("default",[0,1,2,3,4,5,6],20);
                  _loc3_.play("default");
                  _loc3_.depth = _loc29_.integer;
                  this._decorationsFront.add(_loc3_);
               }
               if(!(_loc29_.string == "accelerator" || _loc29_.string == "AcceleratorSingleLight_"))
               {
                  if(!(FlxG.credits && _loc29_.string == "collisionBlock"))
                  {
                     _loc3_ = new FlxSprite(int(_loc29_.real[0]) * 0.641509 + _loc10_,425 - int(_loc29_.real[1]) * 0.641509 + 36);
                     _loc3_.loadGraphic(this["Img" + _loc29_.string] as Class);
                     _loc3_.depth = _loc29_.integer;
                     if(_loc29_.key[4] == "scaleX")
                     {
                        _loc3_.scale.x = Number(_loc29_.real[2]);
                        _loc3_.x += _loc3_.width * 0.5 * _loc3_.scale.x - _loc3_.width * 0.5;
                     }
                     if(_loc29_.key[4] == "scaleY")
                     {
                        _loc3_.scale.y = Number(_loc29_.real[2]);
                        _loc3_.y += _loc3_.height * 0.5 * _loc3_.scale.y - _loc3_.height * 0.5;
                     }
                     if(_loc29_.key[5] == "scaleX")
                     {
                        _loc3_.scale.x = Number(_loc29_.real[3]);
                        _loc3_.x += _loc3_.width * 0.5 * _loc3_.scale.x - _loc3_.width * 0.5;
                     }
                     if(_loc29_.key[5] == "scaleY")
                     {
                        _loc3_.scale.y = Number(_loc29_.real[3]);
                        _loc3_.y += _loc3_.height * 0.5 * _loc3_.scale.y - _loc3_.height * 0.5;
                     }
                     this._decorationsFront.add(_loc3_);
                  }
               }
            }
            _loc1_++;
         }
         var _loc12_:int = 0;
         var _loc13_:int = 0;
         var _loc14_:int = 0;
         var _loc15_:int = 0;
         var _loc16_:int = 0;
         var _loc17_:int = 0;
         _loc1_ = 0;
         while(_loc1_ < this._blocks.members.length)
         {
            if(FlxG.numPlayers > 1)
            {
               break;
            }
            if(this._blocks.members[_loc1_].health > 10)
            {
               _loc15_ = 0;
               while(_loc15_ < this._blocks.members.length)
               {
                  if(_loc15_ != _loc1_)
                  {
                     if(this._blocks.members[_loc15_].health > 10)
                     {
                        if(this._blocks.members[_loc15_].x == this._blocks.members[_loc1_].x)
                        {
                           _loc13_ = 0;
                           _loc14_ = 999;
                           _loc12_ = 0;
                           if(this._blocks.members[_loc15_].y > this._blocks.members[_loc1_].y)
                           {
                              this._blocks.members[_loc1_].health = this._blocks.members[_loc15_].health;
                              _loc17_++;
                              _loc16_ = 0;
                              while(_loc16_ < this._overlapAreas.members.length)
                              {
                                 if(this._overlapAreas.members[_loc16_].x == this._blocks.members[_loc1_].x && this._overlapAreas.members[_loc16_].type == 5)
                                 {
                                    this._overlapAreas.members[_loc16_].num = this._blocks.members[_loc1_].health;
                                 }
                                 if(this._overlapAreas.members[_loc16_].x == this._blocks.members[_loc1_].x && this._overlapAreas.members[_loc16_].type == 4)
                                 {
                                    if(_loc14_ > this._overlapAreas.members[_loc16_].y)
                                    {
                                       _loc13_ = this._overlapAreas.members[_loc16_].x - 111;
                                       _loc14_ = int(this._overlapAreas.members[_loc16_].y);
                                    }
                                    this._overlapAreas.members[_loc16_].num = this._blocks.members[_loc1_].health;
                                    _loc12_ += 34;
                                    this._overlapAreas.members[_loc16_].auxInt = _loc17_;
                                    if(this._checkpointPositions.length < _loc17_)
                                    {
                                       this._checkpointPositions.push(this._overlapAreas.members[_loc16_].x);
                                    }
                                 }
                                 _loc16_++;
                              }
                              _loc1_ += 20;
                              _loc3_ = new FlxSprite(_loc13_,_loc14_ + _loc12_ * 0.5);
                              _loc3_.loadGraphic(this.ImgCheckpointRayAnim,true,false,256,256);
                              _loc3_.addAnimation("idle",[0,1,2,3,4,5],20);
                              _loc3_.addAnimation("trigger",[6,7,8,9,10,11,12],22,false);
                              _loc3_.play("idle");
                              _loc3_.y -= 34 * 3.65;
                              _loc3_.scale.x = 2;
                              _loc3_.scale.y = _loc12_ / 256;
                              _loc3_.scale.y *= 2;
                              _loc3_.depth = 1;
                              _loc3_.health = -40;
                              this._decorations.add(_loc3_);
                              break;
                           }
                           if(this._blocks.members[_loc15_].y < this._blocks.members[_loc1_].y)
                           {
                              this._blocks.members[_loc15_].health = this._blocks.members[_loc1_].health;
                              _loc17_++;
                              _loc16_ = 0;
                              while(_loc16_ < this._overlapAreas.members.length)
                              {
                                 if(this._overlapAreas.members[_loc16_].x == this._blocks.members[_loc1_].x && this._overlapAreas.members[_loc16_].type == 5)
                                 {
                                    this._overlapAreas.members[_loc16_].num = this._blocks.members[_loc1_].health;
                                 }
                                 if(this._overlapAreas.members[_loc16_].x == this._blocks.members[_loc1_].x && this._overlapAreas.members[_loc16_].type == 4)
                                 {
                                    if(_loc14_ > this._overlapAreas.members[_loc16_].y)
                                    {
                                       _loc13_ = this._overlapAreas.members[_loc16_].x - 111;
                                       _loc14_ = int(this._overlapAreas.members[_loc16_].y);
                                    }
                                    this._overlapAreas.members[_loc16_].num = this._blocks.members[_loc1_].health;
                                    _loc12_ += 34;
                                    this._overlapAreas.members[_loc16_].auxInt = _loc17_;
                                    if(this._checkpointPositions.length < _loc17_)
                                    {
                                       this._checkpointPositions.push(this._overlapAreas.members[_loc16_].x);
                                    }
                                 }
                                 _loc16_++;
                              }
                              _loc1_ += 20;
                              _loc3_ = new FlxSprite(_loc13_,_loc14_ + _loc12_ * 0.5);
                              _loc3_.loadGraphic(this.ImgCheckpointRayAnim,true,false,256,256);
                              _loc3_.addAnimation("idle",[0,1,2,3,4,5],20);
                              _loc3_.addAnimation("trigger",[6,7,8,9,10,11,12],20,false);
                              _loc3_.play("idle");
                              _loc3_.y -= 34 * 3.65;
                              _loc3_.scale.x = 2;
                              _loc3_.scale.y = _loc12_ / 256;
                              _loc3_.scale.y *= 2;
                              _loc3_.depth = 1;
                              _loc3_.health = -40;
                              this._decorations.add(_loc3_);
                           }
                           break;
                        }
                     }
                  }
                  _loc15_++;
               }
            }
            _loc1_++;
         }
         this._decorations.members.sortOn("x",Array.NUMERIC | Array.DESCENDING);
         this._decorationsFront.members.sortOn("x",Array.NUMERIC | Array.DESCENDING);
         var _loc18_:int = 0;
         var _loc19_:int;
         var _loc20_:int = _loc19_ = 1100;
         var _loc21_:int = 0;
         var _loc22_:int = 0;
         var _loc23_:* = 0;
         var _loc24_:int = 0;
         var _loc25_:Array = new Array();
         var _loc26_:uint = 0;
         if(FlxG.numPlayers == 1 && !FlxG.credits)
         {
            _loc25_.push(2822);
            _loc25_.push(5704);
            _loc25_.push(7396);
            _loc25_.push(8413);
            _loc25_.push(9425);
            _loc25_.push(13657);
            _loc25_.push(14740);
            _loc25_.push(15830);
            _loc25_.push(21400);
            _loc25_.push(21995);
            _loc25_.push(23673);
            _loc25_.push(46729);
            _loc25_.push(46831);
            _loc25_.push(47525);
            _loc25_.push(47821);
            _loc25_.push(47921);
            _loc25_.push(60179);
            _loc25_.push(61076);
            _loc25_.push(62064);
            _loc25_.push(65360);
            _loc25_.push(69271);
            _loc25_.push(70679);
            _loc25_.push(76886);
            _loc25_.push(77592);
            _loc25_.push(86579);
            _loc25_.push(87469);
            _loc25_.push(88260);
            _loc25_.push(95899);
            _loc25_.push(97489);
            _loc25_.push(99019);
            _loc25_.push(104809);
            _loc25_.push(110439);
            _loc25_.push(111280);
            _loc25_.push(115982);
            _loc25_.push(116985);
            _loc25_.push(119566);
            _loc25_.push(120656);
            _loc25_.push(123628);
            _loc25_.push(124914);
            _loc25_.push(128696);
            _loc25_.push(129598);
            _loc25_.push(131926);
            _loc25_.push(132749);
            _loc25_.push(134821);
            _loc25_.push(135826);
            _loc25_.push(136714);
            _loc25_.push(137901);
            _loc25_.push(138001);
            _loc25_.push(138990);
            _loc25_.push(139882);
            _loc25_.push(140676);
            _loc25_.push(141469);
            _loc25_.push(142162);
            _loc25_.push(144195);
         }
         else if(!FlxG.credits)
         {
            _loc25_.push(2047);
            _loc25_.push(3106);
            _loc25_.push(4008);
            _loc25_.push(5020);
            _loc25_.push(5290);
            _loc25_.push(6087);
            _loc25_.push(7284);
            _loc25_.push(8492);
            _loc25_.push(8533);
            _loc25_.push(9066);
            _loc25_.push(9682);
            _loc25_.push(11728);
            _loc25_.push(14791);
         }
         _loc25_.push(999999);
         _loc23_ = int(this._decorations.members.length - 1);
         while(_loc23_ >= 0)
         {
            if(this._decorations.members[_loc23_].x > _loc20_)
            {
               if(_loc25_[_loc26_] < _loc20_ + _loc19_)
               {
                  _loc20_ = int(_loc25_[_loc26_]);
                  _loc26_++;
                  if(FlxG.round == 1 || FlxG.round == 4)
                  {
                     if(_loc25_[_loc26_] == 10137)
                     {
                        _loc26_++;
                     }
                     else if(_loc25_[_loc26_] == 3106)
                     {
                        _loc26_++;
                     }
                  }
                  else if(FlxG.round == 2 || FlxG.round == 5)
                  {
                     if(_loc25_[_loc26_] == 5290)
                     {
                        _loc26_++;
                     }
                     else if(_loc25_[_loc26_] == 8533)
                     {
                        _loc26_++;
                     }
                  }
                  else if(FlxG.round == 3 || FlxG.round == 6)
                  {
                     if(_loc25_[_loc26_] == 9682)
                     {
                        _loc26_++;
                     }
                     else if(_loc25_[_loc26_] == 3106)
                     {
                        _loc26_++;
                     }
                     else if(_loc25_[_loc26_] == 9480)
                     {
                        _loc26_++;
                     }
                  }
                  _loc21_ = _loc24_ + 1;
                  _loc22_ = 0;
               }
               else
               {
                  _loc20_ += _loc19_;
                  _loc21_ = _loc24_ + 1;
                  _loc22_ = 0;
               }
            }
            this._decorations.members[_loc23_].depth += _loc21_;
            if(this._decorations.members[_loc23_].depth > _loc24_)
            {
               _loc24_ = int(this._decorations.members[_loc23_].depth);
            }
            _loc23_--;
         }
         _loc18_ = 0;
         _loc20_ = _loc19_ = 300;
         _loc21_ = 0;
         _loc23_ = int(this._decorationsFront.members.length - 1);
         while(_loc23_ >= 0)
         {
            if(this._decorationsFront.members[_loc23_].x > _loc20_)
            {
               _loc20_ += _loc19_;
               _loc21_ = _loc24_;
            }
            this._decorationsFront.members[_loc23_].depth += _loc21_;
            if(this._decorationsFront.members[_loc23_].depth > _loc24_)
            {
               _loc24_ = int(this._decorationsFront.members[_loc23_].depth);
            }
            _loc23_--;
         }
         this._decorations.members.sortOn("depth",Array.NUMERIC | Array.DESCENDING);
         this._decorationsFront.members.sortOn("depth",Array.NUMERIC | Array.DESCENDING);
         add(this.background2);
         add(this.background2_2);
         add(this.background2_3);
         add(this.Sun);
         add(this.background1);
         add(this.background1_2);
         add(this.background1_3);
         add(this.bgBackship);
         add(this.bgBackship_2);
         add(this.bgBackship_3);
         add(this.bgShipSmall);
         add(this.bgShipSmall_2);
         add(this.bgShipBig);
         add(this.bgShipBig_2);
         this._blocks.members.sortOn("x",Array.NUMERIC);
         add(this._blocks);
         add(this._decorations);
         this._overlapAreas.members.sortOn("x",Array.NUMERIC);
         add(this._overlapAreas);
         if(FlxG.numPlayers > 1 && (FlxG.round == 2 || FlxG.round == 5))
         {
            add(new FlxSprite(7327,47,this.ImgCoverupR2_1));
            add(new FlxSprite(8384,354,this.ImgCoverupR2_2));
            add(new FlxSprite(8543,81,this.ImgCoverupR2_3));
         }
         if(FlxG.numPlayers > 1 && (FlxG.round == 3 || FlxG.round == 6))
         {
            add(new FlxSprite(10196,354,this.ImgCoverupR3_1));
            add(new FlxSprite(10129,85,this.ImgCoverupR3_2));
         }
         if(FlxG.numPlayers == 1)
         {
            add(new FlxSprite(122040,195,this.ImgCoverupEnd));
            this._players.add(this._player);
         }
         add(this._players);
         add(this._enemies);
         add(this.puffs);
         if(FlxG.numPlayers == 1)
         {
            add(this.sonicBoom);
         }
         add(this._decorationsFront);
         add(this._camera);
         if(!this.debugMode && FlxG.numPlayers == 1)
         {
            this._camera.velocity.x = this._player.velocity.x;
         }
         if(FlxG.numPlayers > 1)
         {
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               _loc1_++;
            }
         }
         if(FlxG.useCam)
         {
            FlxG.follow(this._camera,35);
            FlxG.followAdjust(0,0);
         }
         FlxG.followBounds(0,-40,123090,FlxG.height - 40);
         this._objects = new FlxGroup();
         this._objects.add(this._players);
         this._objects.add(this._enemies);
         FlxG.playMusic(SndMusic);
         FlxG.flash.start(4279442459);
         this._fading = false;
         if(FlxG.numPlayers == 1)
         {
            this._camera.velocity.x = this._player.velocity.x;
         }
         this._player.drag.x = 0;
         this._player.acceleration.x = 0;
         var _loc27_:int = 1680;
         this._firstLiveBlock = 0;
         _loc1_ = 0;
         while(_loc1_ < this._blocks.members.length - 1)
         {
            if(this._blocks.members[_loc1_].x > this._camera.x + 400 || this._blocks.members[_loc1_].x + this._blocks.members[_loc1_].width < this._camera.x - 400)
            {
               this._blocks.members[_loc1_].visible = false;
               this._blocks.members[_loc1_].exists = false;
               this._blocks.members[_loc1_].active = false;
               if(this._blocks.members[_loc1_].x + this._blocks.members[_loc1_].width < this._camera.x - 400)
               {
               }
            }
            _loc1_++;
         }
         this._firstLiveDecoration = 0;
         var _loc28_:Boolean = false;
         _loc1_ = 0;
         while(_loc1_ < this._decorations.members.length - 1)
         {
            if(this._decorations.members[_loc1_].x > this._camera.x + _loc27_ || this._decorations.members[_loc1_].x < this._camera.x - _loc27_)
            {
               this._decorations.members[_loc1_].visible = false;
               this._decorations.members[_loc1_].exists = false;
               this._decorations.members[_loc1_].active = false;
               if(_loc28_ && this._decorations.members[_loc1_].x < this._camera.x - _loc27_)
               {
                  if(this._firstLiveDecoration == 0)
                  {
                     this._firstLiveDecoration = _loc1_ - 1;
                  }
               }
            }
            else
            {
               _loc28_ = true;
            }
            _loc1_++;
         }
         if(this._firstLiveDecoration == 0)
         {
            this._firstLiveDecoration = this._decorations.members.length - 1;
         }
         this._decorations.usedLength = this._firstLiveDecoration;
         _loc1_ = 0;
         while(_loc1_ < this._decorationsFront.members.length - 1)
         {
            if(this._decorationsFront.members[_loc1_].x > this._camera.x + _loc27_ || this._decorationsFront.members[_loc1_].x + this._decorationsFront.members[_loc1_].width < this._camera.x - _loc27_)
            {
               this._decorationsFront.members[_loc1_].visible = false;
               this._decorationsFront.members[_loc1_].exists = false;
               this._decorationsFront.members[_loc1_].active = false;
            }
            _loc1_++;
         }
         this._firstLiveDecorationFront = this._decorationsFront.members.length - 1;
         _loc1_ = 0;
         while(_loc1_ < this._overlapAreas.members.length - 1)
         {
            if(this._overlapAreas.members[_loc1_].x > this._camera.x + 400 || this._overlapAreas.members[_loc1_].x + this._overlapAreas.members[_loc1_].width < this._camera.x - 400)
            {
            }
            _loc1_++;
         }
         this._firstLiveBlock = 0;
         this._firstLiveOverlapArea = 0;
         this._camera.width = 0;
         this._camera.height = 0;
         this._camera.visible = false;
         if(this._keyboard)
         {
            add(this._keyboard);
         }
         if(this._keyX)
         {
            add(this._keyX);
         }
         if(this._keyM)
         {
            add(this._keyM);
         }
         if(this._keyP)
         {
            add(this._keyP);
         }
         if(this._keyQ)
         {
            add(this._keyQ);
         }
         if(this._keyboardX)
         {
            add(this._keyboardX);
         }
         if(this._keyboardM)
         {
            add(this._keyboardM);
         }
         if(this._keyboardP)
         {
            add(this._keyboardP);
         }
         if(this._keyboardQ)
         {
            add(this._keyboardQ);
         }
         this.hudBg = new FlxSprite(0,0,this.ImgHudBg);
         this.hudBg.scrollFactor.x = 0;
         this.hudBg.scrollFactor.y = 0;
         add(this.hudBg);
         add(this._bPause);
         add(this._bSound);
         add(this._bGetIPhone);
         add(this._bSubmitScore);
         if(FlxG.numPlayers > 1)
         {
            add(this._multiEnd);
            this._pressEnterToStart = new FlxText(0,106,FlxG.width,"Press SPACE to start",true);
            this._pressEnterToStart.setFormat("ethno",22,16777215,"center",1118481);
            this._pressEnterToStart.scrollFactor.x = 0;
            this._pressEnterToStart.scrollFactor.y = 0;
            this._pressEnterToStart.visible = false;
            add(this._pressEnterToStart);
         }
         if(FlxG.numPlayers == 1)
         {
            this._score = new FlxText(FlxG.width - 138,29 - 30,132,"" + FlxG.score,true);
            this._score.setFormat("ethno",20,4294967295,"right");
            this._score.scrollFactor.x = 0;
            this._score.scrollFactor.y = 0;
            add(this._score);
            this._levelCleared = new FlxSprite(0,0,this.ImgLevelCleared);
            this._levelCleared.scrollFactor.x = 0;
            this._levelCleared.scrollFactor.y = 0;
            this._levelCleared.visible = false;
            add(this._levelCleared);
            this._timeBonusText = new FlxText(FlxG.width - 109,34 - 30,103,"",true);
            this._timeBonusText.setFormat("ethno",18,4294967295,"right",4278190080);
            this._timeBonusText.scrollFactor.x = 0;
            this._timeBonusText.scrollFactor.y = 0;
            this._timeBonusText.visible = false;
            add(this._timeBonusText);
         }
         if(FlxG.credits)
         {
            this._score.visible = false;
         }
         if(FlxG.numPlayers > 1)
         {
            FlxG.tutorial = true;
         }
         if(FlxG.tutorial)
         {
            if(FlxG.numPlayers == 1)
            {
               this._controls = new FlxSprite(0,0,this.ImgControls);
               this._controls.scrollFactor.x = 0;
               this._controls.scrollFactor.y = 0;
               add(this._controls);
               this._dontGetCaught = new FlxSprite(98,139,this.ImgDontGetCaught);
               this._dontGetCaught.scrollFactor.x = 0;
               this._dontGetCaught.scrollFactor.y = 0;
               this._dontGetCaught.visible = false;
               add(this._dontGetCaught);
               this._continueButton = new FlxButton(206,415,this.OnContinue1);
               this._continueButton.loadGraphic(new FlxSprite(0,0,this.ImgContinue),new FlxSprite(0,0,this.ImgContinueOver));
               this._continueButton.scrollFactor.x = 0;
               this._continueButton.scrollFactor.y = 0;
               add(this._continueButton);
            }
         }
         this._intersticial = new FlxSprite(0,0,this.ImgIntersticial);
         this._intersticial.scrollFactor.x = 0;
         this._intersticial.scrollFactor.y = 0;
         this._intersticial.visible = false;
         add(this._intersticial);
         this._continueInt = new FlxSprite(0,0,ImgContinueInt);
         this._continueInt.scrollFactor.x = 0;
         this._continueInt.scrollFactor.y = 0;
         this._continueInt.visible = false;
         this._continueIntOver = new FlxSprite(0,0,ImgContinueIntOver);
         this._continueIntOver.scrollFactor.x = 0;
         this._continueIntOver.scrollFactor.y = 0;
         this._continueIntOver.visible = false;
         this._highInt = new FlxSprite(0,0,this.ImgHighInt);
         this._highInt.scrollFactor.x = 0;
         this._highInt.scrollFactor.y = 0;
         this._highInt.visible = false;
         this._highIntOver = new FlxSprite(0,0,this.ImgHighIntOver);
         this._highIntOver.scrollFactor.x = 0;
         this._highIntOver.scrollFactor.y = 0;
         this._highIntOver.visible = false;
         this._screenshot2 = new FlxSprite(219,19,ImgScreenshot2);
         this._screenshot2.scrollFactor.x = 0;
         this._screenshot2.scrollFactor.y = 0;
         this._screenshot2.visible = false;
         this._screenshot3 = new FlxSprite(219,19,ImgScreenshot3);
         this._screenshot3.scrollFactor.x = 0;
         this._screenshot3.scrollFactor.y = 0;
         this._screenshot3.visible = false;
         this._getItNowOn = new FlxSprite(0,0,ImgGetItNowOn);
         this._getItNowOn.scrollFactor.x = 0;
         this._getItNowOn.scrollFactor.y = 0;
         this._getItNowOn.visible = false;
         this._getItNowOff = new FlxSprite(0,0,ImgGetItNowOff);
         this._getItNowOff.scrollFactor.x = 0;
         this._getItNowOff.scrollFactor.y = 0;
         this._getItNowOff.visible = false;
         this._getItButton = new FlxButton(169,264,this.onGetIt);
         this._getItButton.scrollFactor.x = 0;
         this._getItButton.scrollFactor.y = 0;
         this._getItButton.loadGraphic(this._getItNowOff,this._getItNowOn);
         this._getItButton.active = false;
         this._getItButton.visible = false;
         add(this._getItButton);
         this._getItNowOn2 = new FlxSprite(169,264,ImgGetItNowOn);
         this._getItNowOn2.scrollFactor.x = 0;
         this._getItNowOn2.scrollFactor.y = 0;
         this._getItNowOn2.visible = false;
         add(this._getItNowOn2);
         this._continueIntButton = new FlxButton(337,381,this.onContinue2);
         this._continueIntButton.scrollFactor.x = 0;
         this._continueIntButton.scrollFactor.y = 0;
         this._continueIntButton.loadGraphic(this._continueInt,this._continueIntOver);
         this._continueIntButton.active = false;
         this._continueIntButton.visible = false;
         add(this._continueIntButton);
         this._highIntButton = new FlxButton(118 - 40,386,this.onHigh);
         this._highIntButton.scrollFactor.x = 0;
         this._highIntButton.scrollFactor.y = 0;
         this._highIntButton.loadGraphic(this._highInt,this._highIntOver);
         this._highIntButton.active = false;
         this._highIntButton.visible = false;
         add(this._highIntButton);
         add(this._screenshot2);
         add(this._screenshot3);
         this._camera.y -= 30;
         this.agi = FlxG.agi;
         addChild(this.agi);
      }
      
      public function restart() : void
      {
         var _loc1_:int = 0;
         var _loc2_:FlxObject = null;
         var _loc3_:FlxSprite = null;
         var _loc4_:OverlapArea = null;
         var _loc7_:ByteArray = null;
         var _loc8_:String = null;
         var _loc9_:XML = null;
         this.reload = false;
         FlxG.timeToReload = 999;
         FlxG.timeScale = 1;
         FlxG.ending = -1;
         FlxG.enemySwitch.length = 0;
         FlxG.fade.stop();
         this._enemies.members.length = 0;
         if(FlxG.useCam)
         {
            if(this.nextCheckpoint > 1)
            {
               FlxG.scroll.x -= this._player.x - this._checkpointPositions[this.nextCheckpoint - 2] - 460;
            }
            else
            {
               FlxG.scroll.x = 0;
            }
            FlxG.follow(this._camera,35);
            FlxG.followAdjust(0,0);
         }
         this._blocks.members[this._blocks.members.length - 13].exists = true;
         this._blocks.members[this._blocks.members.length - 13].solid = true;
         this._blocks.members[this._blocks.members.length - 13].active = true;
         this._blocks.members[this._blocks.members.length - 12].exists = true;
         this._blocks.members[this._blocks.members.length - 12].solid = true;
         this._blocks.members[this._blocks.members.length - 12].active = true;
         this._blocks.members[this._blocks.members.length - 11].exists = true;
         this._blocks.members[this._blocks.members.length - 11].solid = true;
         this._blocks.members[this._blocks.members.length - 11].active = true;
         this._blocks.members[this._blocks.members.length - 10].exists = true;
         this._blocks.members[this._blocks.members.length - 10].solid = true;
         this._blocks.members[this._blocks.members.length - 10].active = true;
         this._decorations.members[39].velocity.y = 0;
         this._decorations.members[39].y = 287;
         this._decorations.members[41].velocity.y = 0;
         this._decorations.members[41].y = 287;
         this._getItNowOn2.visible = false;
         if(this.prevCheckpointX != FlxG.checkpointX)
         {
            this.prevCheckpointX = FlxG.checkpointX;
         }
         if(checkpointSave.bind("flixel"))
         {
            checkpointSave.data.checkpointX = FlxG.checkpointX;
            checkpointSave.data.checkpointY = FlxG.checkpointY;
            checkpointSave.data.timeInCheckpoint = this.timeInCheckpoint;
            checkpointSave.data.score = FlxG.score;
            checkpointSave.data.maxScore = FlxG.maxScore;
            checkpointSave.forceSave();
         }
         this.distanceScore = 0;
         puffIndex = 0;
         this.cameraSpeedOnDeath = 0;
         FlxG.enemySwitch.length = 0;
         FlxG.enemySpawnX = FlxG.checkpointX - 25;
         FlxG.enemySpawnY = FlxG.checkpointY;
         FlxG.enemySpawnSpeed = this.startSpeed;
         this.Sun.visible = true;
         this.background.visible = true;
         this.background1.visible = true;
         this.background1_2.visible = true;
         this.background1_3.visible = true;
         this.background2.visible = true;
         this.background2_2.visible = true;
         this.background2_3.visible = true;
         this.bgBackship.visible = true;
         this.bgBackship_2.visible = true;
         this.bgBackship_3.visible = true;
         this.bgShipBig.visible = true;
         this.bgShipBig_2.visible = true;
         this.bgShipSmall.visible = true;
         this.bgShipSmall_2.visible = true;
         if(FlxG.numPlayers == 1)
         {
            this._player.dead = false;
            this._player.solid = true;
            this._player.exists = true;
            this._player.visible = true;
            this._player.active = true;
            this._player.play("morph");
            this._player.x = FlxG.checkpointX - 25;
            this._player.y = FlxG.checkpointY;
            this._player.velocity.x = this.startSpeed;
            this._player.velocity.y = 0;
            this._player.play("morph");
            this._player.myOnFloor = true;
            this._player.angle = 0;
            this._player.angularVelocity = 0;
            this._player.facing = 1;
            this._player.width = 42;
            this._player.height = 48;
            this._player.offset.x = 10;
            this._player.offset.y = 17;
            this._player.acceleration.y = 30000;
            this._levelCleared.visible = false;
            this._timeBonusText.visible = false;
            this.sonicBoom.visible = false;
            this.sonicBoomLoop.stop();
            if(this._enemy)
            {
               this._enemy.visible = false;
               this._enemy = null;
            }
         }
         else
         {
            this._multiEnd.visible = false;
            Player.currentStanding = FlxG.numPlayers;
            ++FlxG.round;
            if(FlxG.round > 6)
            {
               FlxG.round = 1;
            }
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               if(_loc1_ == 0)
               {
                  this._players.members[_loc1_].x = 316;
                  this._players.members[_loc1_].y = 103;
                  this._players.members[_loc1_].velocity.x = 211.6983;
                  this._players.members[_loc1_].velocity.y = 0;
                  this._players.members[_loc1_].play("morph");
                  this._players.members[_loc1_].myOnFloor = true;
                  this._players.members[_loc1_].dead = false;
                  this._players.members[_loc1_].solid = true;
                  this._players.members[_loc1_].exists = true;
                  this._players.members[_loc1_].visible = true;
                  this._players.members[_loc1_].active = true;
                  this._players.members[_loc1_].angle = 0;
                  this._players.members[_loc1_].angularVelocity = 0;
                  this._players.members[_loc1_].facing = 1;
                  this._players.members[_loc1_].width = 37;
                  this._players.members[_loc1_].height = 48;
                  this._players.members[_loc1_].offset.x = 16;
                  this._players.members[_loc1_].offset.y = 19;
                  this._players.members[_loc1_].acceleration.y = 30000;
               }
               if(_loc1_ == 1)
               {
                  this._players.members[_loc1_].x = 316;
                  this._players.members[_loc1_].y = 325;
                  this._players.members[_loc1_].velocity.x = 211.6983;
                  this._players.members[_loc1_].velocity.y = 0;
                  this._players.members[_loc1_].play("morph");
                  this._players.members[_loc1_].myOnFloor = true;
                  this._players.members[_loc1_].dead = false;
                  this._players.members[_loc1_].solid = true;
                  this._players.members[_loc1_].exists = true;
                  this._players.members[_loc1_].visible = true;
                  this._players.members[_loc1_].active = true;
                  this._players.members[_loc1_].angle = 0;
                  this._players.members[_loc1_].angularVelocity = 0;
                  this._players.members[_loc1_].facing = 1;
                  this._players.members[_loc1_].width = 37;
                  this._players.members[_loc1_].height = 48;
                  this._players.members[_loc1_].offset.x = 16;
                  this._players.members[_loc1_].offset.y = 19;
                  this._players.members[_loc1_].acceleration.y = 30000;
                  this._players.members[_loc1_].SwitchGravity();
               }
               if(_loc1_ == 2)
               {
                  this._players.members[_loc1_].x = 316;
                  this._players.members[_loc1_].y = 240;
                  this._players.members[_loc1_].velocity.x = 211.6983;
                  this._players.members[_loc1_].velocity.y = 0;
                  this._players.members[_loc1_].play("morph");
                  this._players.members[_loc1_].myOnFloor = true;
                  this._players.members[_loc1_].dead = false;
                  this._players.members[_loc1_].solid = true;
                  this._players.members[_loc1_].exists = true;
                  this._players.members[_loc1_].visible = true;
                  this._players.members[_loc1_].active = true;
                  this._players.members[_loc1_].angle = 0;
                  this._players.members[_loc1_].angularVelocity = 0;
                  this._players.members[_loc1_].facing = 1;
                  this._players.members[_loc1_].width = 37;
                  this._players.members[_loc1_].height = 48;
                  this._players.members[_loc1_].offset.x = 16;
                  this._players.members[_loc1_].offset.y = 19;
                  this._players.members[_loc1_].acceleration.y = 30000;
               }
               if(_loc1_ == 3)
               {
                  this._players.members[_loc1_].x = 316;
                  this._players.members[_loc1_].y = 188;
                  this._players.members[_loc1_].velocity.x = 211.6983;
                  this._players.members[_loc1_].velocity.y = 0;
                  this._players.members[_loc1_].play("morph");
                  this._players.members[_loc1_].myOnFloor = true;
                  this._players.members[_loc1_].dead = false;
                  this._players.members[_loc1_].solid = true;
                  this._players.members[_loc1_].exists = true;
                  this._players.members[_loc1_].visible = true;
                  this._players.members[_loc1_].active = true;
                  this._players.members[_loc1_].angle = 0;
                  this._players.members[_loc1_].angularVelocity = 0;
                  this._players.members[_loc1_].facing = 1;
                  this._players.members[_loc1_].width = 37;
                  this._players.members[_loc1_].height = 48;
                  this._players.members[_loc1_].offset.x = 16;
                  this._players.members[_loc1_].offset.y = 19;
                  this._players.members[_loc1_].acceleration.y = 30000;
                  this._players.members[_loc1_].SwitchGravity();
               }
               _loc1_++;
            }
            this._player.x = 300;
            this._player.y = 100;
            this._player.velocity.x = 211.6983;
            this._player.velocity.y = 0;
            this._player.play("morph");
            this._player.myOnFloor = true;
         }
         _loc1_ = 0;
         while(_loc1_ < FlxG.numPlayers * 3 + 3)
         {
            this.puffs.members[_loc1_].exists = false;
            _loc1_++;
         }
         if(FlxG.numPlayers == 1)
         {
            this._camera.x = FlxG.checkpointX + 17;
            this._camera.y = 240;
         }
         else
         {
            this._camera.x = 316;
            this._camera.y = 240;
         }
         _loc1_ = 0;
         while(_loc1_ < this.backgroundSecs.length)
         {
            if(this.backgroundSecs[_loc1_] > this._camera.x)
            {
               this.nextBackgroundSec = _loc1_;
               break;
            }
            _loc1_++;
         }
         this._blocks.cull = true;
         this._decorations.cull = true;
         this._decorationsFront.cull = true;
         if(FlxG.credits)
         {
            this._player.x = 316 - 25;
            this._player.y = 270;
            this._camera.x = 316 + 17;
            if(this._score)
            {
               this._score.visible = false;
            }
         }
         var _loc5_:uint = 0;
         var _loc6_:Number = 0;
         this.background.x = 0;
         this.background.y = 59;
         this.background1.x = 0;
         this.background1.y = 195 + 59;
         this.background1_2.x = 427;
         this.background1_2.y = 195 + 59;
         this.background1_3.x = 854;
         this.background1_3.y = 195 + 59;
         this.background2.x = 0;
         this.background2.y = 205 + 59;
         this.background2_2.x = 444;
         this.background2_2.y = 205 + 59;
         this.background2_3.x = 888;
         this.background2_3.y = 205 + 59;
         this.bgShipBig.x = 0;
         this.bgShipBig.y = 59;
         this.bgShipBig_2.x = 580;
         this.bgShipBig_2.y = 59;
         this.bgShipSmall.x = 426;
         this.bgShipSmall.y = 59;
         this.bgShipSmall_2.x = 1006;
         this.bgShipSmall_2.y = 59;
         this.bgBackship.x = 0;
         this.bgBackship.y = 59;
         this.bgBackship_2.x = 350;
         this.bgBackship_2.y = 59;
         this.bgBackship_3.x = 700;
         this.bgBackship_3.y = 59;
         this.Sun.x = 39;
         this.Sun.y = 207 + 59;
         var _loc10_:uint = 0;
         var _loc11_:int = 5;
         var _loc12_:int = 0;
         var _loc13_:int = 0;
         var _loc14_:int = 0;
         var _loc15_:int = 0;
         var _loc16_:int = 0;
         var _loc17_:int = 0;
         var _loc18_:int = 0;
         var _loc19_:int;
         var _loc20_:int = _loc19_ = 1200;
         var _loc21_:int = 0;
         var _loc22_:int = 0;
         var _loc23_:int = 0;
         var _loc24_:int = 0;
         var _loc25_:uint = 0;
         FlxG.flash.start(4279442459);
         this._fading = false;
         if(FlxG.numPlayers == 1)
         {
            this._camera.velocity.x = this._player.velocity.x;
         }
         this._player.drag.x = 0;
         this._player.acceleration.x = 0;
         var _loc26_:int = 1680;
         _loc1_ = 0;
         while(_loc1_ < this._blocks.members.length)
         {
            this._blocks.members[_loc1_].visible = true;
            this._blocks.members[_loc1_].exists = true;
            this._blocks.members[_loc1_].active = true;
            this._blocks.members[_loc1_].dead = false;
            _loc1_++;
         }
         _loc1_ = 0;
         while(_loc1_ < this._decorations.members.length)
         {
            this._decorations.members[_loc1_].visible = true;
            this._decorations.members[_loc1_].exists = true;
            this._decorations.members[_loc1_].active = true;
            this._decorations.members[_loc1_].dead = false;
            if(this._decorations.members[_loc1_].solid == false)
            {
               this._decorations.members[_loc1_].health = -40;
            }
            _loc1_++;
         }
         _loc1_ = 0;
         while(_loc1_ < this._decorationsFront.members.length)
         {
            this._decorationsFront.members[_loc1_].visible = true;
            this._decorationsFront.members[_loc1_].exists = true;
            this._decorationsFront.members[_loc1_].active = true;
            this._decorationsFront.members[_loc1_].dead = false;
            _loc1_++;
         }
         _loc1_ = 0;
         while(_loc1_ < this._overlapAreas.members.length)
         {
            this._overlapAreas.members[_loc1_].visible = true;
            this._overlapAreas.members[_loc1_].exists = true;
            this._overlapAreas.members[_loc1_].active = true;
            this._overlapAreas.members[_loc1_].dead = false;
            _loc1_++;
         }
         this._firstLiveBlock = 0;
         _loc1_ = 0;
         while(_loc1_ < this._blocks.members.length - 1)
         {
            if(this._blocks.members[_loc1_].x > this._camera.x + 400 || this._blocks.members[_loc1_].x + this._blocks.members[_loc1_].width < this._camera.x - 400)
            {
               this._blocks.members[_loc1_].visible = false;
               this._blocks.members[_loc1_].exists = false;
               this._blocks.members[_loc1_].active = false;
               if(this._blocks.members[_loc1_].x + this._blocks.members[_loc1_].width < this._camera.x - 400)
               {
               }
            }
            _loc1_++;
         }
         this._firstLiveDecoration = 0;
         var _loc27_:Boolean = false;
         _loc1_ = 0;
         while(_loc1_ < this._decorations.members.length - 1)
         {
            if(this._decorations.members[_loc1_].x > this._camera.x + _loc26_ || this._decorations.members[_loc1_].x < this._camera.x - _loc26_)
            {
               this._decorations.members[_loc1_].visible = false;
               this._decorations.members[_loc1_].exists = false;
               this._decorations.members[_loc1_].active = false;
               if(_loc27_ && this._decorations.members[_loc1_].x < this._camera.x - _loc26_)
               {
                  if(this._firstLiveDecoration == 0)
                  {
                     this._firstLiveDecoration = _loc1_ - 1;
                  }
               }
            }
            else
            {
               _loc27_ = true;
            }
            _loc1_++;
         }
         if(this._firstLiveDecoration == 0)
         {
            this._firstLiveDecoration = this._decorations.members.length - 1;
         }
         this._decorations.usedLength = this._firstLiveDecoration;
         _loc1_ = 0;
         while(_loc1_ < this._decorationsFront.members.length - 1)
         {
            if(this._decorationsFront.members[_loc1_].x > this._camera.x + _loc26_ || this._decorationsFront.members[_loc1_].x + this._decorationsFront.members[_loc1_].width < this._camera.x - _loc26_)
            {
               this._decorationsFront.members[_loc1_].visible = false;
               this._decorationsFront.members[_loc1_].exists = false;
               this._decorationsFront.members[_loc1_].active = false;
            }
            _loc1_++;
         }
         this._firstLiveDecorationFront = this._decorationsFront.members.length - 1;
         _loc1_ = 0;
         while(_loc1_ < this._overlapAreas.members.length - 1)
         {
            if(this._overlapAreas.members[_loc1_].x > this._camera.x + 400 || this._overlapAreas.members[_loc1_].x + this._overlapAreas.members[_loc1_].width < this._camera.x - 400)
            {
            }
            _loc1_++;
         }
         if(!FlxG.tutorial)
         {
            this._screenshot2.visible = false;
            this._screenshot3.visible = false;
         }
         this._firstLiveBlock = 0;
         this._firstLiveOverlapArea = 0;
         this._camera.width = 0;
         this._camera.height = 0;
         this._camera.visible = false;
      }
      
      override public function update() : void
      {
         var _loc1_:int = 0;
         var _loc2_:FlxButton = null;
         var _loc3_:uint = 0;
         _loc1_ = 0;
         if(FlxG.tutorial)
         {
            this._camera.velocity.x = 0;
            if(FlxG.numPlayers == 1 && FlxG.keys.justPressed("SPACE"))
            {
               this.OnContinue1();
            }
         }
         if(FlxG.submittingScore)
         {
            return;
         }
         if(FlxG.showIntersticial)
         {
            if(this.flashButton < 50)
            {
               this.flashButton -= FlxG.elapsed;
            }
            else if(this.flashButton > 50)
            {
               this.flashButton += FlxG.elapsed;
            }
            if(this.flashButton <= 0)
            {
               this.flashButton = 100;
               this._getItNowOn2.visible = true;
            }
            if(this.flashButton >= 100.4)
            {
               this.flashButton = 0.4;
               this._getItNowOn2.visible = false;
            }
            this._screenshotChangeTime -= FlxG.elapsed;
            if(this._screenshotChangeTime <= 0)
            {
               this._screenshotChangeTime = 1;
               if(this._screenshot2.visible)
               {
                  this._screenshot2.visible = false;
                  this._screenshot3.visible = true;
               }
               else if(this._screenshot3.visible)
               {
                  this._screenshot3.visible = false;
               }
               else
               {
                  this._screenshot2.visible = true;
               }
            }
            if(FlxG.keys.justPressed("SPACE"))
            {
               this.onContinue2();
            }
         }
         if(!FlxG.useCam)
         {
            FlxG.scroll.x = -this._camera.x + FlxG.width * 0.5;
            FlxG.scroll.y = 40;
         }
         if(FlxG.goToMenu)
         {
            FlxG.goToMenu = false;
            FlxG.state = new MenuState();
            return;
         }
         if(FlxG.timeToReload < 999)
         {
            FlxG.timeToReload -= FlxG.elapsed;
            this._camera.acceleration.x = 0;
            if(this._camera.velocity.x > 0)
            {
               if(this.cameraSpeedOnDeath == 0)
               {
                  this.cameraSpeedOnDeath = this._camera.velocity.x;
               }
               this._camera.velocity.x -= this.cameraSpeedOnDeath * 0.8 * FlxG.elapsed;
            }
            else
            {
               this._camera.velocity.x = 0;
            }
            if(FlxG.timeToReload <= 0 && !this.debugMode)
            {
               if(FlxG.numPlayers == 1)
               {
                  if(!this.reload && !FlxG.credits)
                  {
                  }
                  this.reload = true;
               }
               else
               {
                  if(FlxG.keys.justPressed("ENTER") || FlxG.keys.justPressed("SPACE"))
                  {
                     this.onNext();
                  }
                  if(this._multiEnd.visible == false && FlxG.showIntersticial == false && this.reload == false)
                  {
                     _loc1_ = 0;
                     while(_loc1_ < FlxG.numPlayers)
                     {
                        this._players.members[_loc1_].kill();
                        _loc1_++;
                     }
                     _loc1_ = 0;
                     while(_loc1_ < FlxG.numPlayers)
                     {
                        if(this._players.members[_loc1_].standing == 1)
                        {
                           if(_loc1_ == 0)
                           {
                              add(this._1stPlace = new FlxSprite(87 + this._camera.x - FlxG.width * 0.5,99 + this._camera.y - FlxG.height * 0.5,this.ImgResultBlue));
                           }
                           else if(_loc1_ == 1)
                           {
                              add(this._1stPlace = new FlxSprite(87 + this._camera.x - FlxG.width * 0.5,99 + this._camera.y - FlxG.height * 0.5,this.ImgResultGreen));
                           }
                           else if(_loc1_ == 2)
                           {
                              add(this._1stPlace = new FlxSprite(87 + this._camera.x - FlxG.width * 0.5,99 + this._camera.y - FlxG.height * 0.5,this.ImgResultYellow));
                           }
                           else if(_loc1_ == 3)
                           {
                              add(this._1stPlace = new FlxSprite(87 + this._camera.x - FlxG.width * 0.5,99 + this._camera.y - FlxG.height * 0.5,this.ImgResultRed));
                           }
                           add(this._1st = new FlxSprite(211 + this._camera.x - FlxG.width * 0.5,316 + this._camera.y - FlxG.height * 0.5,this.Img1st));
                           if(this._players.members[_loc1_].wins != 1)
                           {
                              this._wins1 = new FlxText(286 + this._camera.x - FlxG.width * 0.5 - 145,378 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " wins",true);
                           }
                           else
                           {
                              this._wins1 = new FlxText(286 + this._camera.x - FlxG.width * 0.5 - 145,378 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " win",true);
                           }
                           this._wins1.setFormat("ethno",17,4288077032,"right");
                           add(this._wins1);
                        }
                        else if(this._players.members[_loc1_].standing == 2)
                        {
                           if(_loc1_ == 0)
                           {
                              add(this._2ndPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,113 + this._camera.y - FlxG.height * 0.5,this.ImgResultBlueSmall));
                           }
                           else if(_loc1_ == 1)
                           {
                              add(this._2ndPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,113 + this._camera.y - FlxG.height * 0.5,this.ImgResultGreenSmall));
                           }
                           else if(_loc1_ == 2)
                           {
                              add(this._2ndPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,113 + this._camera.y - FlxG.height * 0.5,this.ImgResultYellowSmall));
                           }
                           else if(_loc1_ == 3)
                           {
                              add(this._2ndPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,113 + this._camera.y - FlxG.height * 0.5,this.ImgResultRedSmall));
                           }
                           if(this._players.members[_loc1_].wins != 1)
                           {
                              this._wins2 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,181 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " wins",true);
                           }
                           else
                           {
                              this._wins2 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,181 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " win",true);
                           }
                           this._wins2.setFormat("ethno",17,4288077032,"right");
                           add(this._wins2);
                        }
                        else if(this._players.members[_loc1_].standing == 3)
                        {
                           if(_loc1_ == 0)
                           {
                              add(this._3rdPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,212 + this._camera.y - FlxG.height * 0.5,this.ImgResultBlueSmall));
                           }
                           else if(_loc1_ == 1)
                           {
                              add(this._3rdPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,212 + this._camera.y - FlxG.height * 0.5,this.ImgResultGreenSmall));
                           }
                           else if(_loc1_ == 2)
                           {
                              add(this._3rdPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,212 + this._camera.y - FlxG.height * 0.5,this.ImgResultYellowSmall));
                           }
                           else if(_loc1_ == 3)
                           {
                              add(this._3rdPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,212 + this._camera.y - FlxG.height * 0.5,this.ImgResultRedSmall));
                           }
                           if(this._players.members[_loc1_].wins != 1)
                           {
                              this._wins3 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,280 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " wins",true);
                           }
                           else
                           {
                              this._wins3 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,280 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " win",true);
                           }
                           this._wins3.setFormat("ethno",17,4288077032,"right");
                           add(this._wins3);
                        }
                        else if(this._players.members[_loc1_].standing == 4)
                        {
                           if(_loc1_ == 0)
                           {
                              add(this._4thPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,309 + this._camera.y - FlxG.height * 0.5,this.ImgResultBlueSmall));
                           }
                           else if(_loc1_ == 1)
                           {
                              add(this._4thPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,309 + this._camera.y - FlxG.height * 0.5,this.ImgResultGreenSmall));
                           }
                           else if(_loc1_ == 2)
                           {
                              add(this._4thPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,309 + this._camera.y - FlxG.height * 0.5,this.ImgResultYellowSmall));
                           }
                           else if(_loc1_ == 3)
                           {
                              add(this._4thPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,309 + this._camera.y - FlxG.height * 0.5,this.ImgResultRedSmall));
                           }
                           if(this._players.members[_loc1_].wins != 1)
                           {
                              this._wins4 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,377 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " wins",true);
                           }
                           else
                           {
                              this._wins4 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,377 + this._camera.y - FlxG.height * 0.5,145,this._players.members[_loc1_].wins + " win",true);
                           }
                           this._wins4.setFormat("ethno",17,4288077032,"right");
                           add(this._wins4);
                        }
                        _loc1_++;
                     }
                     if(FlxG.numPlayers < 4)
                     {
                        add(this._4thPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,309 + this._camera.y - FlxG.height * 0.5,this.ImgResultNoneSmall));
                        this._wins4 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,377 + this._camera.y - FlxG.height * 0.5,145,"------------",true);
                        this._wins4.setFormat("ethno",17,4288077032,"right");
                        add(this._wins4);
                     }
                     if(FlxG.numPlayers < 3)
                     {
                        add(this._3rdPlace = new FlxSprite(360 + this._camera.x - FlxG.width * 0.5,212 + this._camera.y - FlxG.height * 0.5,this.ImgResultNoneSmall));
                        this._wins3 = new FlxText(577 + this._camera.x - FlxG.width * 0.5 - 145,280 + this._camera.y - FlxG.height * 0.5,145,"------------",true);
                        this._wins3.setFormat("ethno",17,4288077032,"right");
                        add(this._wins3);
                     }
                     this._endButton = new FlxButton(103,424,this.onEnd);
                     this._endButton.loadGraphic(new FlxSprite(0,0,this.ImgEndButton),new FlxSprite(0,0,this.ImgEndButtonOver));
                     this._endButton.scrollFactor.x = 0;
                     this._endButton.scrollFactor.y = 0;
                     add(this._endButton);
                     this._nextButton = new FlxButton(402,424,this.onNext);
                     this._nextButton.loadGraphic(new FlxSprite(0,0,this.ImgNextButton),new FlxSprite(0,0,this.ImgNextButtonOver));
                     this._nextButton.scrollFactor.x = 0;
                     this._nextButton.scrollFactor.y = 0;
                     add(this._nextButton);
                     this._multiEnd.visible = true;
                     FlxG.play(SndWin);
                  }
               }
            }
         }
         super.update();
         if(this._showEndingCredits == 2)
         {
            FlxG.state = new PlayState();
         }
         if(this._showEndingCredits > 0)
         {
            ++this._showEndingCredits;
            if(checkpointSave.bind("flixel"))
            {
               FlxG.checkpointX = 299;
               FlxG.checkpointY = 270;
               FlxG.score = 0;
               FlxG.maxScore = 0;
               FlxG.lastRealCheckpointScore = 0;
               checkpointSave.data.checkpointX = 299;
               checkpointSave.data.checkpointY = 270;
               checkpointSave.data.checkpointX = null;
               checkpointSave.forceSave();
               checkpointSave.erase();
            }
            return;
         }
         if(FlxG.keys.justPressed("P") && !FlxG.pause && FlxG.numPlayers < 3)
         {
            this.onPause();
         }
         if(this.playingAccelLoop > 0)
         {
            this.playingAccelLoop -= FlxG.elapsed;
            if(this.playingAccelLoop <= 0)
            {
               this.playingAccelLoop = 0;
               this.accelLoop.stop();
            }
         }
         if(FlxG.score + this.distanceScore > FlxG.maxScore)
         {
            FlxG.maxScore = FlxG.score + this.distanceScore;
         }
         if(this.interCountdown > 0)
         {
            this.interCountdown -= FlxG.elapsed;
            this.interCountdownText.text = "" + int(this.interCountdown + 1);
            this._highIntButton.active = true;
            this._highIntButton.visible = true;
            if(this.interCountdown <= 0)
            {
               _loc2_ = new FlxButton(337,381,this.onContinue2);
               _loc2_.scrollFactor.x = 0;
               _loc2_.scrollFactor.y = 0;
               _loc2_.loadGraphic(new FlxSprite(0,0,this.ImgContinue),new FlxSprite(0,0,this.ImgContinueOver));
               add(_loc2_);
               this.interCountdownText.visible = false;
            }
         }
         if(FlxG.ending > -1)
         {
            FlxG.ending += FlxG.elapsed;
            if(FlxG.ending > 1.07)
            {
               if(FlxG.timeScale < 1)
               {
                  FlxG.timeScale += FlxG.elapsed * 2.5;
                  if(FlxG.timeScale > 1)
                  {
                     FlxG.timeScale = 1;
                  }
                  this._player.velocity.x += FlxG.elapsed * 1500;
                  if(this._player.velocity.x > 600)
                  {
                     this._player.velocity.x = 600;
                  }
               }
            }
            if(FlxG.ending > 3 && this._theEnd == null && FlxG.showIntersticial == false)
            {
               FlxG.play(SndPopupAppear);
               this._theEnd = new FlxSprite(0,0,this.ImgTheEnd);
               this._theEnd.scrollFactor.x = 0;
               this._theEnd.scrollFactor.y = 0;
               this._theEnd.scale.x = 0.5;
               this._theEnd.scale.y = 0.5;
               add(this._theEnd);
            }
            if(Boolean(FlxG.ending > 3) && Boolean(this._theEnd) && this._theEnd.scale.x < 1)
            {
               this._theEnd.scale.x += FlxG.elapsed * 2;
               this._theEnd.scale.y += FlxG.elapsed * 2;
               if(this._theEnd.scale.x > 1)
               {
                  this._theEnd.scale.x = 1;
                  this._theEnd.scale.y = 1;
                  this._theEndScore = new FlxText(0,231,FlxG.width,"" + FlxG.score);
                  this._theEndScore.scrollFactor.x = 0;
                  this._theEndScore.scrollFactor.y = 0;
                  this._theEndScore.setFormat("ethno",31,16777215,"center");
                  add(this._theEndScore);
                  this._endContinueButton = new FlxButton(213,281,this.OnEndContinue);
                  this._endContinueButton.loadGraphic(new FlxSprite(0,0,this.ImgContinue),new FlxSprite(0,0,this.ImgContinueOver));
                  this._endContinueButton.scrollFactor.x = 0;
                  this._endContinueButton.scrollFactor.y = 0;
                  add(this._endContinueButton);
                  if(checkpointSave.bind("flixel"))
                  {
                     checkpointSave.data.checkpointX = null;
                     checkpointSave.data.checkpointY = null;
                     checkpointSave.data.score = null;
                     checkpointSave.forceSave();
                  }
               }
            }
         }
         if(FlxG.tutorial && FlxG.numPlayers > 1)
         {
            if(this._players.members[0]._curFrame > 16)
            {
               multiStartFlicker -= FlxG.elapsed;
            }
            if(multiStartFlicker <= 0)
            {
               multiStartFlicker = 0.8;
               _loc1_ = 0;
               while(_loc1_ < FlxG.numPlayers)
               {
                  this._players.members[_loc1_].visible = true;
                  _loc1_++;
               }
               this._pressEnterToStart.visible = true;
               this._keyX.visible = true;
               this._keyM.visible = true;
               if(this._keyP)
               {
                  this._keyP.visible = true;
               }
               if(this._keyQ)
               {
                  this._keyQ.visible = true;
               }
            }
            if(multiStartFlicker < 0.4)
            {
               _loc1_ = 0;
               while(_loc1_ < FlxG.numPlayers)
               {
                  if(this._players.members[_loc1_]._curFrame > 16)
                  {
                     this._players.members[_loc1_].visible = false;
                  }
                  _loc1_++;
               }
               this._pressEnterToStart.visible = false;
            }
            if(FlxG.keys.justPressed("ENTER") || FlxG.keys.justPressed("SPACE"))
            {
               FlxG.tutorial = false;
               this._screenshot2.visible = false;
               this._screenshot3.visible = false;
               _loc1_ = 0;
               while(_loc1_ < FlxG.numPlayers)
               {
                  this._players.members[_loc1_].visible = true;
                  _loc1_++;
               }
               this._pressEnterToStart.visible = false;
               this._keyX.visible = true;
               this._keyM.visible = true;
               if(this._keyP)
               {
                  this._keyP.visible = true;
               }
               if(this._keyQ)
               {
                  this._keyQ.visible = true;
               }
               this._keyboardX.visible = false;
               this._keyboardM.visible = false;
               if(this._keyboardP)
               {
                  this._keyboardP.visible = false;
               }
               if(this._keyboardQ)
               {
                  this._keyboardQ.visible = false;
               }
               this._keyboard.visible = false;
            }
         }
         if(FlxG.numPlayers == 1)
         {
            if(this.levelClearedTime > 0)
            {
               this._levelCleared.visible = true;
               if(this.levelClearedTime > this.levelClearedTimeMax - 0.3)
               {
                  this._levelCleared.scale.x = (this.levelClearedTimeMax - this.levelClearedTime) / 1 + 0.7;
                  this._levelCleared.scale.y = (this.levelClearedTimeMax - this.levelClearedTime) / 1 + 0.7;
               }
               else
               {
                  this._levelCleared.scale.x = 1;
                  this._levelCleared.scale.y = 1;
               }
               if(this.levelClearedTime < 1)
               {
                  this._levelCleared.alpha = this.levelClearedTime;
               }
               this.levelClearedTime -= FlxG.elapsed;
               if(this.levelClearedTime < 0)
               {
                  this.levelClearedTime = 0;
                  this._levelCleared.alpha = 1;
                  this._levelCleared.visible = false;
               }
            }
            if(this.timeBonusTime > 0)
            {
               this._timeBonusText.visible = true;
               if(this.timeBonusTime < 1)
               {
                  this._timeBonusText.alpha = this.timeBonusTime;
               }
               this.timeBonusTime -= FlxG.elapsed;
               if(this.timeBonusTime < 0)
               {
                  this.timeBonusTime = 0;
                  this._timeBonusText.alpha = 1;
                  this._timeBonusText.visible = false;
                  this._timeBonusText.velocity.y = 0;
               }
            }
            if(this._player.x > 122800 && FlxG.ending > -1)
            {
               if(FlxG.ending <= 0.75)
               {
                  FlxG.quake.start(0.01,0.45);
                  FlxG.timeScale = 0.25;
                  this._player.velocity.x = 100;
               }
               _loc1_ = 0;
               while(_loc1_ < this._decorations.members.length)
               {
                  if(!this._decorations.members[_loc1_].visible)
                  {
                  }
                  _loc1_++;
               }
               this._decorations.members[39].velocity.y = 300;
               this._decorations.members[42].velocity.y = 300;
               this._blocks.members[this._blocks.members.length - 13].exists = false;
               this._blocks.members[this._blocks.members.length - 13].solid = false;
               this._blocks.members[this._blocks.members.length - 13].active = false;
               this._blocks.members[this._blocks.members.length - 12].exists = false;
               this._blocks.members[this._blocks.members.length - 12].solid = false;
               this._blocks.members[this._blocks.members.length - 12].active = false;
               this._blocks.members[this._blocks.members.length - 11].exists = false;
               this._blocks.members[this._blocks.members.length - 11].solid = false;
               this._blocks.members[this._blocks.members.length - 11].active = false;
            }
            this._score.text = "" + (FlxG.score + this.distanceScore);
            if(!FlxG.showIntersticial && !FlxG.tutorial)
            {
               this.timeInCheckpoint += FlxG.elapsed;
            }
            if(this.nextCheckpoint > 1)
            {
               this.distanceScore = (this._player.x - this._checkpointPositions[this.nextCheckpoint - 2]) / (this._checkpointPositions[this.nextCheckpoint - 1] - this._checkpointPositions[this.nextCheckpoint - 2]) * (this.nextCheckpoint * 100);
            }
            else
            {
               this.distanceScore = (this._player.x - FlxG.checkpointX - 25) / (this._checkpointPositions[this.nextCheckpoint - 1] - FlxG.checkpointX - 25) * (this.nextCheckpoint * 100);
            }
            if(this._enemy)
            {
               if(this._enemy.x < 6580 && this._enemy.y > 280 && this._enemy.x > 6170)
               {
                  this._enemy.color = 4281940281;
               }
               else if(this._enemy.color == 3750201)
               {
                  this._enemy.color = 16777215;
               }
            }
            if(this._player.x < 6580 && this._player.y > 280 && this._player.x > 6170 && !FlxG.credits)
            {
               this._player.color = 4281940281;
            }
            else if(this._player.color == 3750201 || this._player._curAnim.name == "death")
            {
               this._player.color = 16777215;
            }
            if(this._player.velocity.x >= 513.208)
            {
               this.sonicBoom.visible = true;
               if(this._player.x < 122640 && FlxG.mute == false)
               {
                  this.sonicBoomLoop.play();
               }
               if(this._player.facing == 1)
               {
                  this.sonicBoom.x = this._player.x - 40;
                  this.sonicBoom.y = this._player.y - 16;
               }
               else
               {
                  this.sonicBoom.x = this._player.x - 40;
                  this.sonicBoom.y = this._player.y - 3;
               }
               if(this._player.velocity.y > 1 && !this._player.myOnFloor)
               {
                  this.sonicBoom.angle = 20;
               }
               else if(this._player.velocity.y < -1 && !this._player.myOnFloor)
               {
                  this.sonicBoom.angle = -20;
               }
               else
               {
                  this.sonicBoom.angle = 0;
               }
            }
            if(this._player.dead)
            {
               this.sonicBoom.visible = false;
               this.sonicBoomLoop.stop();
            }
            if(this._player._curAnim.name == "push")
            {
               this.sonicBoom.visible = false;
               this.sonicBoomLoop.stop();
            }
            if(this._player._curAnim.name == "death")
            {
               this.sonicBoom.visible = false;
               this.sonicBoomLoop.stop();
            }
         }
         if(FlxG.numPlayers > 1)
         {
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               if(this._players.members[0]._curAnim.name != "morph")
               {
                  this._players.members[_loc1_].velocity.x = this._camera.velocity.x;
                  this._players.members[_loc1_].acceleration.x = this._camera.acceleration.x;
               }
               if(this._players.members[_loc1_].x >= this._camera.x)
               {
                  this._players.members[_loc1_].x = this._camera.x;
               }
               else
               {
                  this._players.members[_loc1_].x += (this._camera.x - this._players.members[_loc1_].x) / 5 * FlxG.elapsed;
               }
               _loc1_++;
            }
            _loc3_ = 0;
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               if(this._players.members[_loc1_].dead)
               {
                  _loc3_++;
               }
               _loc1_++;
            }
            if(_loc3_ >= FlxG.numPlayers - 1 && FlxG.timeToReload == 999)
            {
               FlxG.timeToReload = 1.7;
               if(this._camera.velocity.x < 0)
               {
                  this._camera.velocity.x = 0;
               }
               ++FlxG.numDeaths;
            }
         }
         if(!this.debugMode && FlxG.numPlayers == 1)
         {
            if(this._player.y > 500 && FlxG.timeToReload == 999 && this._player.x < 122640)
            {
               FlxG.timeToReload = 1.3;
               this._player.velocity.x = 0;
               if(!FlxG.credits)
               {
                  ++FlxG.numDeaths;
               }
            }
            else if(this._player.y < -60 && FlxG.timeToReload == 999 && this._player.x < 123640)
            {
               FlxG.timeToReload = 1.3;
               this._player.velocity.x = 0;
               if(!FlxG.credits)
               {
                  ++FlxG.numDeaths;
               }
               this.sonicBoomLoop.stop();
            }
            else if(this._player.y > 1000)
            {
               this._player.y = 1000;
               this.sonicBoomLoop.stop();
            }
            if(this._enemy != null)
            {
               if(this._enemy.y > 500 || this._enemy.y < -60 || this._enemy.x < this._camera.x - 405)
               {
                  if(this._player._curAnim.name == "run")
                  {
                     this._enemy = null;
                     FlxG.enemySpawnX = this._player.x;
                     FlxG.enemySpawnY = this._player.y;
                     FlxG.enemySpawnSpeed = this._player.velocity.x;
                     FlxG.enemySwitch.length = 0;
                     FlxG.enemySpawnFacing = this._player.facing;
                  }
               }
            }
            if(FlxG.timeToReload == 999)
            {
               if(!FlxG.tutorial)
               {
                  this._camera.velocity.x = this._player.velocity.x;
               }
               if(this._camera.x > this._player.x + 21)
               {
                  this._camera.velocity.x = (1 - (this._camera.x - this._player.x) / 352) * this._player.velocity.x;
               }
            }
         }
         FlxG.cameraX = this._camera.x;
         if(this._enemy == null && FlxG.numPlayers == 1 && !FlxG.credits)
         {
            if(this._camera.x - 369 > FlxG.enemySpawnX && this._player.x < 123244)
            {
               this._enemy = new Enemy(FlxG.enemySpawnX,FlxG.enemySpawnY,FlxG.enemySpawnSpeed,FlxG.enemySpawnFacing);
               this._enemies.add(this._enemy);
            }
         }
         if(this._camera.x < this._player.x && !this.debugMode && FlxG.timeToReload == 999)
         {
            this._camera.x = this._player.x;
            this._camera.drag.x = 0;
         }
         if(this._camera.x > this.backgroundSecs[this.nextBackgroundSec])
         {
            if(this.nextBackgroundSec % 2 == 0)
            {
               this.Sun.visible = false;
               this.background.visible = false;
               this.background1.visible = false;
               this.background1_2.visible = false;
               this.background1_3.visible = false;
               this.background2.visible = false;
               this.background2_2.visible = false;
               this.background2_3.visible = false;
               this.bgBackship.visible = false;
               this.bgBackship_2.visible = false;
               this.bgBackship_3.visible = false;
               this.bgShipBig.visible = false;
               this.bgShipBig_2.visible = false;
               this.bgShipSmall.visible = false;
               this.bgShipSmall_2.visible = false;
            }
            else
            {
               this.Sun.visible = true;
               this.background.visible = true;
               this.background1.visible = true;
               this.background1_2.visible = true;
               this.background1_3.visible = true;
               this.background2.visible = true;
               this.background2_2.visible = true;
               this.background2_3.visible = true;
               this.bgBackship.visible = true;
               this.bgBackship_2.visible = true;
               this.bgBackship_3.visible = true;
               this.bgShipBig.visible = true;
               this.bgShipBig_2.visible = true;
               this.bgShipSmall.visible = true;
               this.bgShipSmall_2.visible = true;
            }
            ++this.nextBackgroundSec;
         }
         if(this.background1.x <= -427)
         {
            this.background1.x += 1281;
         }
         if(this.background1_2.x <= -427)
         {
            this.background1_2.x += 1281;
         }
         if(this.background1_3.x <= -427)
         {
            this.background1_3.x += 1281;
         }
         this.background1.velocity.x = -this._camera.velocity.x * 0.5;
         this.background1_2.velocity.x = -this._camera.velocity.x * 0.5;
         this.background1_3.velocity.x = -this._camera.velocity.x * 0.5;
         if(this.background2.x <= -444)
         {
            this.background2.x += 1332;
         }
         if(this.background2_2.x <= -444)
         {
            this.background2_2.x += 1332;
         }
         if(this.background2_3.x <= -444)
         {
            this.background2_3.x += 1332;
         }
         this.background2.velocity.x = -this._camera.velocity.x * 0.25;
         this.background2_2.velocity.x = -this._camera.velocity.x * 0.25;
         this.background2_3.velocity.x = -this._camera.velocity.x * 0.25;
         if(this.bgBackship.x <= -350)
         {
            this.bgBackship.x += 1050;
         }
         if(this.bgBackship_2.x <= -350)
         {
            this.bgBackship_2.x += 1050;
         }
         if(this.bgBackship_3.x <= -350)
         {
            this.bgBackship_3.x += 1050;
         }
         this.bgBackship.velocity.x = -this._camera.velocity.x * 0.26;
         this.bgBackship_2.velocity.x = -this._camera.velocity.x * 0.26;
         this.bgBackship_3.velocity.x = -this._camera.velocity.x * 0.26;
         if(this.bgShipBig.x <= -346)
         {
            this.bgShipBig.x += 1220;
         }
         if(this.bgShipBig_2.x <= -346)
         {
            this.bgShipBig_2.x += 1220;
         }
         this.bgShipBig.velocity.x = -this._camera.velocity.x * 0.37;
         this.bgShipBig_2.velocity.x = -this._camera.velocity.x * 0.37;
         if(this.bgShipSmall.x <= -346)
         {
            this.bgShipSmall.x += 1220;
         }
         if(this.bgShipSmall_2.x <= -346)
         {
            this.bgShipSmall_2.x += 1220;
         }
         this.bgShipSmall.velocity.x = -this._camera.velocity.x * 0.37;
         this.bgShipSmall_2.velocity.x = -this._camera.velocity.x * 0.37;
         if(this._camera.x >= 123040 - FlxG.width * 0.5)
         {
            this.background1.velocity.x = 0;
            this.background1_2.velocity.x = 0;
            this.background1_3.velocity.x = 0;
            this.background2.velocity.x = 0;
            this.background2_2.velocity.x = 0;
            this.background2_3.velocity.x = 0;
            this.bgBackship.velocity.x = 0;
            this.bgBackship_2.velocity.x = 0;
            this.bgBackship_3.velocity.x = 0;
            this.bgShipBig.velocity.x = 0;
            this.bgShipBig_2.velocity.x = 0;
            this.bgShipSmall.velocity.x = 0;
            this.bgShipSmall_2.velocity.x = 0;
         }
         this.OptimizeArray(this._blocks,1,this._firstLiveBlock);
         this.OptimizeArrayReverse(this._decorationsFront,3,this._firstLiveDecorationFront);
         if(this._player.x < 123050)
         {
            this.OptimizeArrayReverse(this._decorations,2,this._firstLiveDecoration);
         }
         FlxU.collide(this._blocks,this._objects);
         FlxU.overlap(this._player,this._overlapAreas,this.OverlapTile);
         FlxU.overlap(this._enemy,this._overlapAreas,this.OverlapTile);
         if(FlxG.numPlayers == 1)
         {
            FlxU.overlap(this._player,this._enemy,this.OverlapEnemy);
         }
         if(FlxG.numPlayers > 1)
         {
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               this._players.members[_loc1_].inPlayerCollision = false;
               _loc1_++;
            }
            _loc1_ = 0;
            while(_loc1_ < 10)
            {
               FlxU.overlap(this._players,this._players,this.collideMovingPlayers);
               _loc1_++;
            }
            _loc1_ = 0;
            while(_loc1_ < FlxG.numPlayers)
            {
               if(_loc1_ == 0)
               {
                  this._keyX.x = this._players.members[_loc1_].x - 7;
                  this._keyX.y = this._players.members[_loc1_].y - 3;
                  if(this._players.members[_loc1_].dead)
                  {
                     this._keyX.visible = false;
                  }
               }
               if(_loc1_ == 1)
               {
                  this._keyM.x = this._players.members[_loc1_].x - 7;
                  this._keyM.y = this._players.members[_loc1_].y - 3;
                  if(this._players.members[_loc1_].dead)
                  {
                     this._keyM.visible = false;
                  }
               }
               if(_loc1_ == 2)
               {
                  this._keyP.x = this._players.members[_loc1_].x - 7;
                  this._keyP.y = this._players.members[_loc1_].y - 3;
                  if(this._players.members[_loc1_].dead)
                  {
                     this._keyP.visible = false;
                  }
               }
               if(_loc1_ == 3)
               {
                  this._keyQ.x = this._players.members[_loc1_].x - 7;
                  this._keyQ.y = this._players.members[_loc1_].y - 3;
                  if(this._players.members[_loc1_].dead)
                  {
                     this._keyQ.visible = false;
                  }
               }
               _loc1_++;
            }
         }
         if(this.reload && !FlxG.showIntersticial)
         {
            if(FlxG.numDeaths >= 8)
            {
               FlxG.numDeaths = 0;
               FlxG.showIntersticial = true;
               FlxG.play(SndPopupAppear);
               this._intersticial.visible = true;
               this._getItButton.active = true;
               this._getItButton.visible = true;
               this._continueIntButton.active = true;
               this._continueIntButton.visible = true;
               this._highIntButton.active = true;
               this._highIntButton.visible = true;
            }
            else
            {
               if(FlxG.numPlayers == 1)
               {
                  FlxG.fade.start(4278190080,0.2,this.onFade);
               }
               if(FlxG.numPlayers > 1)
               {
                  FlxG.state = new PlayState();
                  return;
               }
            }
         }
      }
      
      protected function onPause() : void
      {
         if(checkpointSave.bind("flixel"))
         {
            checkpointSave.data.checkpointX = FlxG.checkpointX;
            checkpointSave.data.checkpointY = FlxG.checkpointY;
            checkpointSave.data.score = FlxG.score;
            checkpointSave.forceSave();
         }
         FlxG.pause = true;
         FlxPause._bMenu.visible = true;
         FlxPause._bResume.visible = true;
         FlxPause.pauseBg.visible = true;
      }
      
      protected function onSound() : void
      {
         if(!FlxG.mute)
         {
            FlxG.mute = true;
            this._bSound.loadGraphic(new FlxSprite(58,0,this.ImgSoundBut),new FlxSprite(58,0,this.ImgSoundButHL));
         }
         else
         {
            FlxG.mute = false;
            this._bSound.loadGraphic(new FlxSprite(58,0,this.ImgSoundButOn),new FlxSprite(58,0,this.ImgSoundButOnHL));
         }
         this._bSound.x = 58;
         this._bSound.y = 0;
      }
      
      protected function onGetIPhone() : void
      {
         FlxG.miniclipTrack.loadITunes();
         FlxU.openURL("http://www.miniclip.com/iphone/appstore.php?name=gravity-guy&id=398348506");
      }
      
      protected function onEnd() : void
      {
         FlxG.state = new MenuState();
      }
      
      protected function onNext() : void
      {
         FlxG.play(SndPopupDisappear);
         this.reload = true;
         this._multiEnd.visible = false;
         this._nextButton.visible = false;
         this._endButton.visible = false;
         this._1st.visible = false;
         this._1stPlace.visible = false;
         this._2ndPlace.visible = false;
         this._3rdPlace.visible = false;
         this._4thPlace.visible = false;
         this._wins1.visible = false;
         this._wins2.visible = false;
         this._wins3.visible = false;
         this._wins4.visible = false;
         super.update();
         this._multiEnd.visible = false;
      }
      
      protected function onFade() : void
      {
         if(!FlxG.credits)
         {
            this.restart();
         }
         else
         {
            FlxG.state = new MenuState();
         }
      }
      
      protected function OnContinue1() : void
      {
         FlxG.play(SndPopupDisappear);
         if(this._continueButton.y > 310)
         {
            this._controls.visible = false;
            this._dontGetCaught.visible = true;
            this._continueButton.x = 209;
            this._continueButton.y = 288;
            this._continueButton.loadGraphic(new FlxSprite(209,288,this.ImgContinue),new FlxSprite(209,288,this.ImgContinueOver));
         }
         else
         {
            FlxG.tutorial = false;
            this._dontGetCaught.visible = false;
            this._continueButton.active = false;
            this._continueButton.visible = false;
            this._continueButton.exists = false;
            this._continueButton.dead = true;
            this._screenshot2.visible = false;
            this._screenshot3.visible = false;
         }
      }
      
      protected function onContinue2() : void
      {
         var _loc1_:FlxSprite = null;
         FlxG.play(SndPopupDisappear);
         FlxG.showIntersticial = false;
         this._intersticial.visible = false;
         this._intersticial.active = false;
         this._intersticial.visible = false;
         this._getItButton.active = false;
         this._getItButton.visible = false;
         this._continueIntButton.active = false;
         this._continueIntButton.visible = false;
         this._highIntButton.active = false;
         this._highIntButton.visible = false;
         this._getItNowOn2.visible = false;
         if(this._player.x > 123000)
         {
            FlxG.credits = true;
            this._showEndingCredits = 1;
            _loc1_ = new FlxSprite(0,0,MenuState.ImgLoadingSplash);
            _loc1_.scrollFactor.x = 0;
            _loc1_.scrollFactor.y = 0;
            if(checkpointSave.bind("flixel"))
            {
               checkpointSave.data.checkpointX = null;
               checkpointSave.erase();
            }
            add(_loc1_);
            if(this._endContinueButton)
            {
               this._endContinueButton.visible = false;
               this._endContinueButton.active = false;
            }
            if(this._theEnd)
            {
               this._theEnd.visible = false;
            }
            if(this._screenshot2)
            {
               this._screenshot2.visible = false;
            }
            if(this._screenshot3)
            {
               this._screenshot3.visible = false;
            }
         }
      }
      
      protected function OnEndContinue() : void
      {
         FlxG.play(SndPopupDisappear);
         this._theEnd.visible = false;
         this._theEndScore.visible = false;
         this._theEnd = null;
         this._endContinueButton.visible = false;
         this._endContinueButton.active = false;
         FlxG.showIntersticial = true;
         this._intersticial.visible = true;
         this._intersticial.active = true;
         this._intersticial.visible = true;
         this._getItButton.active = true;
         this._getItButton.visible = true;
         this.interCountdown = 8;
         this.interCountdownText = new FlxText(407,408 - 15,100,"8");
         this.interCountdownText.setFormat("ethno",26,16777215,"center");
         this.interCountdownText.scrollFactor.x = 0;
         this.interCountdownText.scrollFactor.y = 0;
         add(this.interCountdownText);
         this._getItNowOn2.visible = true;
      }
      
      protected function onSubmitScore() : void
      {
         if(FlxG.loadedAPI)
         {
            this.agi.showScoreboardSubmit(FlxG.maxScore);
            this.agi.initAGUI({"onClose":this.handleAGUIClose});
            FlxG.submittingScore = true;
         }
      }
      
      protected function onGetIt() : void
      {
         FlxG.miniclipTrack.loadITunes();
         FlxU.openURL("http://www.miniclip.com/iphone/appstore.php?name=gravity-guy&id=398348506");
      }
      
      protected function onMiniclip() : void
      {
         FlxU.openURL("http://www.armorgames.com");
      }
      
      protected function onSpeed(param1:FlxObject, param2:FlxObject) : void
      {
         if(this._player.velocity.x < 769.812)
         {
            this._player.velocity.x += -0.0320755 * this._player.velocity.x + 51.3208;
            if(this._enemy != null)
            {
               this._enemy.velocity.x += -0.0320755 * this._enemy.velocity.x + 51.3208;
            }
         }
         else
         {
            this._player.velocity.x += -0.0320755 * this._player.velocity.x + 51.3208;
            if(this._enemy != null)
            {
               this._enemy.velocity.x += -0.0320755 * this._enemy.velocity.x + 51.3208;
            }
         }
         param2.kill();
      }
      
      protected function OverlapEnemy(param1:FlxObject, param2:FlxObject) : void
      {
         if(this._player._curAnim.name != "death")
         {
            this._player.play("death");
            FlxG.play(SndCaught);
            FlxG.flash.start(4294967295,0.45);
            FlxG.timeToReload = 998;
            var _temp_1:* = FlxG;
            ++FlxG.numDeaths;
         }
      }
      
      protected function OverlapTile(param1:FlxObject, param2:FlxObject) : void
      {
         var _loc3_:Player = null;
         var _loc4_:Enemy = null;
         var _loc5_:OverlapArea = null;
         var _loc6_:* = 0;
         var _loc7_:Number = NaN;
         var _loc8_:uint = 0;
         _loc3_ = param1 as Player;
         _loc4_ = param1 as Enemy;
         _loc5_ = param2 as OverlapArea;
         if(_loc5_.type == 2)
         {
            if(param1.health != -999)
            {
               if(this._player.velocity.x < 769.812)
               {
                  this._player.velocity.x += -0.05 * this._player.velocity.x + 51.3208;
                  if(this._enemy != null)
                  {
                     this._enemy.velocity.x += -0.05 * this._enemy.velocity.x + 51.3208;
                  }
               }
               else
               {
                  this._player.velocity.x += -0.05 * 769.812 + 51.3208;
                  if(this._enemy != null)
                  {
                     this._enemy.velocity.x += -0.05 * 769.812 + 51.3208;
                  }
               }
            }
            else if(this._enemy != null)
            {
               if(this._enemy.velocity.x < 769.812)
               {
                  this._enemy.velocity.x += -0.05 * this._enemy.velocity.x + 51.3208;
               }
               else
               {
                  this._enemy.velocity.x += -0.05 * 769.812 + 51.3208;
               }
            }
            if(FlxG.mute == false)
            {
               if(!this.accelLoop.playing)
               {
                  FlxG.play(SndAccelTrigger,0.7);
               }
               this.accelLoop.play();
               this.playingAccelLoop = 65 / param1.velocity.x;
            }
            _loc5_.health = -1;
            param2.kill();
         }
         if(_loc5_.type == 4)
         {
            if(param1.health == -999)
            {
               return;
            }
            _loc3_.velocity.x = _loc5_.num;
            param2.visible = false;
            _loc5_.visible = false;
            _loc5_.health = -1;
            param2.kill();
            _loc6_ = 0;
            _loc6_ = this._firstLiveDecoration;
            while(_loc6_ > 0)
            {
               if(this._decorations.members[_loc6_].health == -40)
               {
                  if(this._player._curAnim.name != "morph")
                  {
                     FlxG.play(SndLevelCleared);
                     this._decorations.members[_loc6_].play("trigger");
                     FlxG.flash.start(4294049777,0.75);
                     FlxG.score += 100 * this.nextCheckpoint;
                     _loc7_ = this.timeInCheckpoint / (this.nextCheckpoint * 100);
                     if(_loc7_ > 1)
                     {
                        _loc7_ = 1;
                     }
                     _loc7_ = (-_loc7_ + 1) * (-_loc7_ + 1);
                     _loc8_ = _loc7_ * this.nextCheckpoint * 100;
                     if(_loc8_ > 0)
                     {
                        FlxG.score += _loc8_;
                     }
                     this.timeInCheckpoint = 0;
                     ++this.nextCheckpoint;
                     this.distanceScore = 0;
                     this.levelClearedTime = this.levelClearedTimeMax;
                     this._levelCleared.y = this._player.getScreenXY().y + 6;
                     this._levelCleared.x = 23;
                     if(_loc8_ > 0)
                     {
                        this._timeBonusText.text = "+" + _loc8_;
                        this._timeBonusText.y = 23;
                        this._timeBonusText.velocity.y = -4.7;
                        this.timeBonusTime = this.timeBonusTimeMax;
                     }
                     if(this._player.x < 121240)
                     {
                        FlxG.lastRealCheckpointScore = FlxG.score;
                     }
                  }
                  else
                  {
                     this.nextCheckpoint = _loc5_.auxInt + 1;
                     this._decorations.members[_loc6_].kill();
                     this._decorations.members[_loc6_].visible = false;
                     FlxG.lastRealCheckpointScore = FlxG.score;
                  }
                  this._decorations.members[_loc6_].health = -1;
                  this._decorations.members[_loc6_].solid = false;
               }
               else if(this._decorations.members[_loc6_].health == -30 && this._decorations.members[_loc6_].y > this._player.y)
               {
                  if(param2.x + 21 < 122400)
                  {
                     FlxG.checkpointY = this._decorations.members[_loc6_].y - this._player.height;
                  }
                  else
                  {
                     FlxG.ending = 0;
                     if(this._player.facing == FlxSprite.LEFT)
                     {
                        this._player.SwitchGravity();
                     }
                     FlxG.timeScale = 0.5;
                  }
                  this.sonicBoom.visible = false;
                  this.sonicBoomLoop.stop();
               }
               else if(this._decorations.members[_loc6_].x > this._camera.x + 60)
               {
                  break;
               }
               _loc6_--;
            }
            _loc6_ = this._firstLiveOverlapArea;
            while(_loc6_ < this._overlapAreas.members.length - 1)
            {
               if(this._overlapAreas.members[_loc6_].type != 5)
               {
                  if(this._overlapAreas.members[_loc6_].x == _loc5_.x)
                  {
                     this._overlapAreas.members[_loc6_].kill();
                  }
                  if(this._overlapAreas.members[_loc6_].x < this._camera.x - 360)
                  {
                     break;
                  }
               }
               _loc6_++;
            }
            if(FlxG.checkpointX < this._player.x)
            {
               if(param2.x + 21 < 122400)
               {
                  FlxG.checkpointX = param2.x + 21;
               }
            }
         }
         if(_loc5_.type == 5)
         {
            if(param1.health != -999)
            {
               return;
            }
            _loc4_.velocity.x = _loc5_.num;
            param2.visible = false;
            _loc5_.visible = false;
            _loc5_.health = -1;
            param2.kill();
            _loc6_ = this._firstLiveOverlapArea;
            while(_loc6_ < this._overlapAreas.members.length - 1)
            {
               if(this._overlapAreas.members[_loc6_].x == _loc5_.x)
               {
                  this._overlapAreas.members[_loc6_].kill();
               }
               if(this._overlapAreas.members[_loc6_].x < this._camera.x - 360)
               {
                  break;
               }
               _loc6_++;
            }
         }
      }
      
      protected function OptimizeArray(param1:FlxGroup, param2:uint, param3:int) : void
      {
         var _loc4_:int = 0;
         _loc4_ = 0;
         if(param2 == 1)
         {
            param3 = this._firstLiveBlock;
         }
         else if(param2 == 4)
         {
            param3 = this._firstLiveOverlapArea;
         }
         _loc4_ = param3;
         while(_loc4_ < param1.members.length - 1)
         {
            if(Boolean(param1.members[_loc4_].visible) && param1.members[_loc4_].x + 34 < this._camera.x - 400)
            {
               param3 = _loc4_ + 1;
               param1.members[_loc4_].visible = false;
               param1.members[_loc4_].active = false;
               param1.members[_loc4_].exists = false;
               param1.members[_loc4_].dead = true;
            }
            else
            {
               if(!(param1.members[_loc4_].x < this._camera.x + 120 && param1.members[_loc4_].health != -1))
               {
                  param1.firstMember = param3;
                  param1.usedLength = _loc4_;
                  if(param2 == 1)
                  {
                     this._firstLiveBlock = param3;
                  }
                  else if(param2 == 4)
                  {
                     this._firstLiveOverlapArea = param3;
                  }
                  break;
               }
               param1.members[_loc4_].visible = true;
               param1.members[_loc4_].active = true;
               param1.members[_loc4_].exists = true;
               param1.members[_loc4_].dead = false;
            }
            _loc4_++;
         }
         if(param2 == 1)
         {
            this._firstLiveBlock = param3;
         }
         else if(param2 == 4)
         {
            this._firstLiveOverlapArea = param3;
         }
         param1.firstMember = param3;
      }
      
      protected function OptimizeArrayReverse(param1:FlxGroup, param2:uint, param3:int) : void
      {
         var _loc4_:* = 0;
         _loc4_ = 0;
         if(param2 == 2)
         {
            param3 = this._firstLiveDecoration;
         }
         else if(param2 == 3)
         {
            param3 = this._firstLiveDecorationFront;
         }
         _loc4_ = param3;
         while(_loc4_ > 0)
         {
            if(Boolean(param1.members[_loc4_].visible) && param1.members[_loc4_].x < this._camera.x - 1600)
            {
               param3 = _loc4_ - 1;
               param1.members[_loc4_].visible = false;
               param1.members[_loc4_].active = false;
               param1.members[_loc4_].exists = false;
               param1.members[_loc4_].dead = true;
            }
            else
            {
               if(param1.members[_loc4_].x >= this._camera.x + 1390)
               {
                  param1.firstMember = _loc4_;
                  param1.usedLength = param3 + 1;
                  if(param2 == 2)
                  {
                     this._firstLiveDecoration = param3;
                  }
                  else if(param2 == 3)
                  {
                     this._firstLiveDecorationFront = param3;
                  }
                  break;
               }
               if(param1.members[_loc4_].health != -1)
               {
                  param1.members[_loc4_].visible = true;
                  param1.members[_loc4_].active = true;
                  param1.members[_loc4_].exists = true;
                  param1.members[_loc4_].dead = false;
               }
            }
            _loc4_--;
         }
         if(param2 == 2)
         {
            this._firstLiveDecoration = param3;
         }
         else if(param2 == 3)
         {
            this._firstLiveDecorationFront = param3;
         }
         param1.firstMember = _loc4_;
      }
      
      private function onHigh() : void
      {
         if(FlxG.loadedAPI)
         {
            this.agi.showScoreboardSubmit(FlxG.maxScore);
            this.agi.initAGUI({"onClose":this.handleAGUIClose});
            this._continueIntButton.active = false;
            this._highIntButton.active = false;
            this._getItButton.active = false;
         }
      }
      
      protected function handleAGUIClose() : void
      {
         if(!FlxG.submittingScore)
         {
            this._continueIntButton.active = true;
            this._highIntButton.active = true;
            this._getItButton.active = true;
         }
         else
         {
            FlxG.submittingScore = false;
         }
      }
      
      private function collideMovingPlayers(param1:Player, param2:Player) : void
      {
         var _loc7_:Number = NaN;
         var _loc8_:Number = NaN;
         var _loc9_:Boolean = false;
         var _loc3_:Number = param1.x;
         var _loc4_:Number = param1.y;
         var _loc5_:Number = param2.x;
         var _loc6_:Number = param2.y;
         if(param1 == param2)
         {
            return;
         }
         param1.y -= param1.velocity.y * FlxG.elapsed;
         param2.y -= param2.velocity.y * FlxG.elapsed;
         if(Math.abs(param1.y - param2.y) >= param1.height - 8)
         {
            _loc9_ = true;
         }
         else
         {
            _loc9_ = false;
         }
         param1.y += param1.velocity.y * FlxG.elapsed;
         param2.y += param2.velocity.y * FlxG.elapsed;
         if(_loc9_)
         {
            _loc7_ = param1.velocity.y * FlxG.elapsed - param2.velocity.y * FlxG.elapsed;
            if(_loc7_ < 0)
            {
               _loc7_ *= -1;
            }
            if(_loc7_ == 0)
            {
               return;
            }
            _loc8_ = 48 - Math.abs(param1.y - param2.y);
            if(param1.velocity.y >= 0 && param2.velocity.y <= 0 || param1.velocity.y <= 0 && param2.velocity.y >= 0)
            {
               if(param1.y > param2.y)
               {
                  param1.y += _loc8_ * (Math.abs(param1.velocity.y * FlxG.elapsed) / _loc7_);
                  param2.y -= _loc8_ * (Math.abs(param2.velocity.y * FlxG.elapsed) / _loc7_);
               }
               else
               {
                  param1.y -= _loc8_ * (Math.abs(param1.velocity.y * FlxG.elapsed) / _loc7_);
                  param2.y += _loc8_ * (Math.abs(param2.velocity.y * FlxG.elapsed) / _loc7_);
               }
            }
            else if(param1.velocity.y > 0 || param2.velocity.y > 0)
            {
               if(param1.y > param2.y)
               {
                  param2.y = param1.y - param1.height;
               }
               else
               {
                  param1.y = param2.y - param2.height;
               }
            }
            else if(param1.y > param2.y)
            {
               param1.y = param2.y + param2.height;
            }
            else
            {
               param2.y = param1.y + param1.height;
            }
            if(param1.velocity.y == 0 || param2.velocity.y == 0 || param1.velocity.y > 0 && param2.velocity.y < 0 || param1.velocity.y < 0 && param2.velocity.y > 0)
            {
               if(param1.velocity.y > 0)
               {
                  param1.facing = 1;
               }
               if(param1.velocity.y < 0)
               {
                  param1.facing = 0;
               }
               if(param2.velocity.y > 0)
               {
                  param2.facing = 1;
               }
               if(param2.velocity.y < 0)
               {
                  param2.facing = 0;
               }
               param1.velocity.y = 0;
               param2.velocity.y = 0;
            }
         }
         else if(param1.x < param2.x)
         {
            param1.x = param2.x - param2.width * 1.1;
         }
         else
         {
            param2.x = param1.x - param1.width * 1.1;
         }
         if((param1 as Player).inPlayerCollision)
         {
         }
         if((param2 as Player).inPlayerCollision)
         {
         }
         (param1 as Player).inPlayerCollision = true;
         (param2 as Player).inPlayerCollision = true;
      }
   }
}

