# FFmpeg Node - 构建说明

## 构建流程

这个项目使用 vcpkg 来管理 FFmpeg 依赖，将源码解压到 `lib_sources` 目录，使用简洁的路径配置。

### 1. 安装 vcpkg 和 FFmpeg

```bash
npm run install:vcpkg
```

这个命令会：
- 克隆 vcpkg 仓库到 `./vcpkg`
- 初始化 vcpkg
- 安装 FFmpeg 和相关依赖（x264, avcodec, avformat, etc.）
- 下载 FFmpeg 源码包到 `vcpkg/downloads/`

所有的库文件和头文件都在 `vcpkg/installed/<triplet>/` 目录下。

### 2. 准备构建

```bash
npm run prepare
```

这个命令会：
- 从 `vcpkg/downloads/ffmpeg-*.tar.gz` 解压源码到 `lib_sources/ffmpeg/`
- 复制 vcpkg 生成的配置文件（config.h, config_components.h）到 `lib_sources/ffmpeg/`
- 转换 `ffmpeg.c` 的 `main()` 函数为 `ffmpeg_entry()` 并生成 `src/ffmpeg_crt.c`

### 3. 编译 Node 模块

```bash
npm run build
```

或者一次性完成所有步骤：

```bash
npm install
```

## 目录结构

```
.
├── vcpkg/                          # vcpkg 根目录
│   ├── installed/<triplet>/        # 编译好的库和头文件
│   │   ├── include/                # FFmpeg 头文件
│   │   └── lib/                    # FFmpeg 静态库
│   ├── downloads/                  # 下载的源码包
│   │   └── ffmpeg-*.tar.gz         # FFmpeg 源码压缩包
│   └── buildtrees/ffmpeg/          # FFmpeg 构建产物
│       └── <triplet>-rel/          # 构建目录（包含 config.h）
├── lib_sources/                    # FFmpeg 源码目录
│   └── ffmpeg/                     # 解压后的 FFmpeg 源码
│       ├── fftools/                # fftools 源文件
│       ├── libavcodec/             # avcodec 库
│       ├── libavformat/            # avformat 库
│       ├── config.h                # vcpkg 配置文件（自动复制）
│       └── config_components.h     # vcpkg 组件配置（自动复制）
├── src/
│   ├── addon.c                     # N-API 绑定代码
│   └── ffmpeg_crt.c                # 转换后的 ffmpeg main 函数（自动生成）
├── scripts/
│   ├── install_vcpkg.js            # vcpkg 安装脚本
│   ├── prepare.js                  # 构建准备脚本
│   ├── prepare_ffmpeg_source.js   # FFmpeg 源码解压脚本
│   └── utils.js                    # 工具函数
└── binding.gyp                     # node-gyp 配置
```

## binding.gyp 说明

`binding.gyp` 使用简洁的路径配置：

- **源文件**: 直接引用 `lib_sources/ffmpeg/fftools/` 中的源文件
- **头文件**: 
  - `lib_sources/ffmpeg` - FFmpeg 源码根目录
  - `lib_sources/ffmpeg/fftools` - fftools 头文件
  - `vcpkg/installed/<triplet>/include` - vcpkg 编译的库头文件
- **库文件**: 使用 `vcpkg/installed/<triplet>/lib` 中的静态库

相比之前复杂的动态路径查找，现在所有路径都是明确和可预测的。

## Triplet 说明

不同平台使用不同的 triplet：

- **Windows**: `x64-windows-static`
- **macOS (Intel)**: `x64-osx`
- **macOS (Apple Silicon)**: `arm64-osx`
- **Linux**: `x64-linux`

## 清理

```bash
# 清理构建产物
npm run clean

# 完全清理（包括 vcpkg）
npm run clean:all
```

## 注意事项

1. **`lib_sources/` 目录** - 包含解压后的 FFmpeg 源码，已添加到 `.cursorignore` 中
2. **`src/ffmpeg_crt.c` 是自动生成的** - 不要手动编辑，运行 `npm run prepare` 会重新生成
3. **`lib_sources/ffmpeg/config.h` 是自动复制的** - 从 vcpkg 构建目录复制而来
4. **首次构建需要较长时间** - vcpkg 需要编译 FFmpeg 和所有依赖
5. **路径简洁明了** - 不再使用复杂的动态路径查找

## 开发工作流

1. 修改代码后，只需运行 `npm run build`
2. 如果 vcpkg 更新了 FFmpeg，删除 `lib_sources/ffmpeg` 并运行 `npm run prepare` 重新准备
3. 如果需要更改 FFmpeg 配置或依赖，修改 `scripts/install_vcpkg.js` 中的 features

## 与旧版本的差异

旧版本使用复杂的路径查找逻辑：
- 在 `binding.gyp` 中使用 `node -p` 动态查找 vcpkg buildtrees 中的源码
- 路径不稳定，依赖 vcpkg 的内部目录结构

新版本使用固定路径：
- FFmpeg 源码解压到 `lib_sources/ffmpeg/`
- `binding.gyp` 中直接使用简单的相对路径
- 更清晰，更容易维护和理解

