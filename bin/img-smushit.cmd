@echo off
SETLOCAL ENABLEEXTENSIONS

REM 判断文件类型

if "%~x1" NEQ ".jpg" (
    if "%~x1" NEQ ".gif" (
        if "%~x1" NEQ ".png" (
            echo.
            echo **** 请选择图片文件
            echo.
            goto End
        )
    )
)
 

   
"node.exe" "%~dp0fe" imgmin "%~n1%~x1"   
goto End 
 
 
:End
ENDLOCAL
pause