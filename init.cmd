@echo off
color 03
REM =====================================
REM   初始化web项目 0.1 Author Theowang
REM
REM =====================================
SETLOCAL ENABLEEXTENSIONS
 
echo.
echo 初始化web项目 0.1 Author Theowang

:FEinit
node cmdfe "%~dpf1"
goto End


:End
ENDLOCAL
pause