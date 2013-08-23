@echo off

SETLOCAL ENABLEEXTENSIONS
 
:FEinit
node "%~dp0\\cmdfe" "%~dpf1"
goto End


:End
ENDLOCAL
pause