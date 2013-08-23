@echo off
SETLOCAL ENABLEEXTENSIONS
 
REM 过滤文件后缀，只build html文件
if "%~x1" NEQ ".html" (
    if "%~x1" NEQ ".htm" (
        echo.
        echo **** 请选择html文件
        echo.
        goto End
    )
)
 

   
"node.exe" "%~dp0fe" build "%~n1%~x1"   
goto End 
 
 
:End
ENDLOCAL
pause