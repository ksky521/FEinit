@echo off
SETLOCAL ENABLEEXTENSIONS
 
REM 过滤文件后缀，只压缩js和css
if "%~x1" NEQ ".js" (
    if "%~x1" NEQ ".css" (
        echo.
        echo **** 请选择CSS或JS文件
        echo.
        goto End
    )
)
 
copy %~n1%~x1 %~n1.min%~x1
set RESULT_FILE=%~n1%~x1

if "%~x1" == ".js" (
    REM 调用js压缩文件    
    "node.exe" "%~dp0fe" js -b "%RESULT_FILE%" -o "%RESULT_FILE%"    
)

if "%~x1" == ".css" (
    "node.exe" "%~dp0fe" css -b "%RESULT_FILE%" -o "%RESULT_FILE%"
)

goto End 
 
 
:End
ENDLOCAL
pause