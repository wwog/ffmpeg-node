@echo off
REM MinGW-w64 环境设置脚本

echo 检查 MinGW-w64 环境...

REM 检查是否已安装 MinGW
where gcc >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 找到 GCC 编译器
    gcc --version
    goto :build
)

REM 尝试从常见路径找到 MinGW
set MINGW_PATHS=C:\msys64\mingw64\bin;C:\msys64\mingw32\bin;C:\mingw64\bin;C:\mingw32\bin

for %%p in (%MINGW_PATHS%) do (
    if exist "%%p\gcc.exe" (
        echo ✓ 找到 MinGW 路径: %%p
        set PATH=%%p;%PATH%
        set CC=gcc
        set CXX=g++
        goto :build
    )
)

echo ✗ 未找到 MinGW-w64 安装
echo.
echo 请安装 MinGW-w64:
echo 1. 从 https://www.msys2.org/ 下载 MSYS2
echo 2. 运行: pacman -S mingw-w64-x86_64-gcc
echo 3. 或者从 https://www.mingw-w64.org/downloads/ 下载预编译版本
echo.
pause
exit /b 1

:build
echo.
echo ✓ MinGW-w64 环境准备就绪
echo 开始编译...
node-gyp rebuild

if %errorlevel% equ 0 (
    echo.
    echo ✓ 编译成功！
) else (
    echo.
    echo ✗ 编译失败
    pause
)
