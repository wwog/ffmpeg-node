# Windows 构建说明

## 问题说明

在 Windows 上使用 MSVC 编译器时，由于 C11 标准支持不完整，会出现以下错误：
```
error C1189: #error: "C atomics require C11 or later"
```

## 解决方案：使用 MinGW-w64

MinGW-w64 对 C11 标准有更好的支持，可以解决这个问题。

## 安装 MinGW-w64

### 方法 1：使用 MSYS2（推荐）

1. 从 [MSYS2 官网](https://www.msys2.org/) 下载并安装 MSYS2
2. 打开 MSYS2 终端，运行：
   ```bash
   pacman -S mingw-w64-x86_64-gcc
   pacman -S mingw-w64-x86_64-make
   ```

### 方法 2：使用预编译版本

1. 从 [MinGW-w64 官网](https://www.mingw-w64.org/downloads/) 下载预编译版本
2. 解压到 `C:\mingw64\` 目录
3. 将 `C:\mingw64\bin` 添加到系统 PATH 环境变量

## 构建项目

### 自动设置（推荐）

```bash
# 使用批处理脚本
scripts\setup_mingw.bat

# 或使用 npm 脚本
npm run build:mingw
```

### 手动设置

1. 确保 MinGW-w64 在 PATH 中
2. 设置环境变量：
   ```cmd
   set CC=gcc
   set CXX=g++
   ```
3. 运行构建：
   ```bash
   npm run build
   ```

## 验证安装

运行以下命令验证 MinGW 是否正确安装：

```bash
gcc --version
g++ --version
```

应该看到类似输出：
```
gcc (Rev10, Built by MSYS2 project) 13.2.0
Copyright (C) 2023 Free Software Foundation, Inc.
```

## 故障排除

### 如果仍然出现 C11 错误

1. 确保使用的是 MinGW-w64 而不是旧的 MinGW
2. 检查 GCC 版本是否支持 C11（需要 4.9+）
3. 清理构建缓存：`npm run clean`

### 如果找不到 MinGW

1. 检查 PATH 环境变量是否包含 MinGW 的 bin 目录
2. 重启命令行窗口
3. 使用完整路径运行 gcc

## 技术说明

- MinGW-w64 使用 GCC 编译器，对 C11 标准有完整支持
- 配置使用 `-std=c11` 标志确保 C11 标准
- 静态链接避免运行时依赖问题
