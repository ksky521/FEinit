@echo off
color 03
REM =====================================
REM    FEinit 美化
REM
REM =====================================
SETLOCAL ENABLEEXTENSIONS
 
echo.
 
REM 过滤文件后缀，只压缩js和css
if "%~x1" NEQ ".js" (
    echo.
    echo **** 请选择JS文件
    echo.
    goto End
)
 
REM 检查NODE_PATH
if "%NODE_PATH%" == "" goto NoNodePath
if not exist "%NODE_PATH%\node.exe" goto NoNodePath

 
set RESULT_FILE=%~n1.bea.%~x1
 
REM 调用Uglify-js压缩文件
"%NODE_PATH%\node.exe" "%~dp0uglifyjs" -b "%~n1%~x1" > "%RESULT_FILE%"
echo.
echo **** ~O(∩_∩)O~ 美化成功 ****
echo.
goto End 
 
:NoNodePath
echo.
echo **** 请先安装nodejs并设置NODE_PATH环境变量 ****
echo.
 
:End
ENDLOCAL
pause