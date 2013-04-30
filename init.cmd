@echo off

SETLOCAL ENABLEEXTENSIONS
 
:FEinit
node cmdfe "%~dpf1"
goto End


:End
ENDLOCAL
pause