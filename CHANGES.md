# 更新说明

## 构建流程重构

### 改动概述

简化了构建流程，直接使用 vcpkg 的源码和库文件，不再进行文件复制。

### 新的工作流程

**步骤 1: 安装 vcpkg**
```bash
npm run install:vcpkg
```
- 安装 vcpkg 和 FFmpeg
- 所有文件保留在 `vcpkg/` 目录下

**步骤 2: 准备构建**
```bash
npm run prepare
```
- 定位 vcpkg 源码
- 复制配置文件到源码目录
- 生成 `src/ffmpeg_crt.c`

**步骤 3: 编译**
```bash
npm run build
```

或者一次完成：
```bash
npm install
```

### 主要变化

#### ✅ 不再生成的内容
- ❌ `lib_work/` 目录 - 不再复制库文件
- ❌ 动态生成的 `binding.gyp` - 现在是手动维护的固定文件

#### ✅ 新增/保留的内容
- ✅ `binding.gyp` - 手动维护，直接引用 vcpkg 目录
- ✅ `src/ffmpeg_crt.c` - 自动生成（从 ffmpeg.c 转换）
- ✅ vcpkg 配置文件复制到源码目录

#### 📝 脚本变化

**删除的脚本：**
- `scripts/build_vcpkg.js` - 原来的复杂构建脚本
- `scripts/gen_ffmpeg.js` - 功能已合并到 `prepare.js`
- `scripts/vcpkg_installer.js` - 被 `install_vcpkg.js` 替代

**新增的脚本：**
- `scripts/install_vcpkg.js` - 只负责安装 vcpkg
- `scripts/prepare.js` - 准备构建环境

**保留的脚本：**
- `scripts/utils.js` - 工具函数

### binding.gyp 设计

新的 `binding.gyp` 直接引用 vcpkg 目录：

- **头文件**: `vcpkg/installed/<triplet>/include`
- **库文件**: `vcpkg/installed/<triplet>/lib`
- **源码**: `vcpkg/buildtrees/ffmpeg/src/<version>.clean`

所有路径在构建时动态解析，使用 Node.js 表达式（`<!@(node -p "...")`）。

### 优势

1. **更简单** - 不需要维护 `lib_work` 目录
2. **更快** - 不需要复制大量库文件
3. **更清晰** - 所有文件都在 vcpkg 目录下，结构清晰
4. **更易维护** - `binding.gyp` 是固定的，不会每次构建都变化

### 注意事项

- 首次运行 `npm install` 会花费较长时间（vcpkg 编译 FFmpeg）
- `binding.gyp` 现在需要手动维护
- 如果修改了 FFmpeg 配置，需要更新 `scripts/install_vcpkg.js`

