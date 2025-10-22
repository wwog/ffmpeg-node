/**
 * 构建准备脚本
 * 1. 准备 FFmpeg 源码
 * 2. 复制配置文件
 * 3. 转换 main 函数为 ffmpeg_entry
 */
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const { prepareFFmpegSource } = require('./prepare_ffmpeg_source');

class BuildPreparer {
  constructor() {
    this.vcpkgRoot = path.join(process.cwd(), 'vcpkg');
    this.triplet = utils.getTriplet();
    this.ffmpegSourcePath = path.join(process.cwd(), 'lib_sources', 'ffmpeg');
  }

  /**
   * 准备 FFmpeg 源码
   */
  prepareSource() {
    utils.printStep(1, '准备 FFmpeg 源码');
    
    // 使用新的准备脚本
    prepareFFmpegSource();
    
    // 验证源码目录
    if (!utils.fileExists(this.ffmpegSourcePath)) {
      throw new Error('FFmpeg 源码准备失败');
    }
    
    // 验证 fftools 存在
    const fftoolsPath = path.join(this.ffmpegSourcePath, 'fftools');
    if (!utils.fileExists(fftoolsPath)) {
      throw new Error(`fftools 目录不存在: ${fftoolsPath}`);
    }
    
    utils.printSuccess(`使用 FFmpeg 源码: ${this.ffmpegSourcePath}`);
  }

  /**
   * 复制 vcpkg 配置文件
   */
  copyVcpkgConfig() {
    utils.printStep(2, '复制 vcpkg 配置文件');
    
    // vcpkg 构建目录中的 config.h
    const vcpkgBuildPath = path.join(this.vcpkgRoot, 'buildtrees', 'ffmpeg', `${this.triplet}-rel`);
    const vcpkgConfigH = path.join(vcpkgBuildPath, 'config.h');
    const vcpkgConfigComponents = path.join(vcpkgBuildPath, 'config_components.h');
    
    // 目标位置（源码目录）
    const targetConfigH = path.join(this.ffmpegSourcePath, 'config.h');
    const targetConfigComponents = path.join(this.ffmpegSourcePath, 'config_components.h');
    
    // 复制文件
    if (utils.fileExists(vcpkgConfigH)) {
      utils.copyFile(vcpkgConfigH, targetConfigH);
      console.log(`✓ 复制 config.h`);
    } else {
      utils.printWarning(`vcpkg config.h 不存在: ${vcpkgConfigH}`);
    }
    
    if (utils.fileExists(vcpkgConfigComponents)) {
      utils.copyFile(vcpkgConfigComponents, targetConfigComponents);
      console.log(`✓ 复制 config_components.h`);
    } else {
      utils.printWarning(`vcpkg config_components.h 不存在`);
    }
    
    utils.printSuccess('vcpkg 配置文件复制完成');
  }

  /**
   * 修补 stdbit.h 兼容性问题
   */
  patchStdbitHeader() {
    utils.printStep(3, '修补 stdbit.h 兼容性');
    
    const ffmpegDecPath = path.join(this.ffmpegSourcePath, 'fftools', 'ffmpeg_dec.c');
    
    if (!utils.fileExists(ffmpegDecPath)) {
      utils.printWarning(`文件不存在: ${ffmpegDecPath}`);
      return;
    }
    
    let content = utils.readFile(ffmpegDecPath);
    
    // 检查是否已经修补过
    if (content.includes('/* stdbit.h compatibility patch */')) {
      console.log('✓ stdbit.h 已修补，跳过');
      return;
    }
    
    // 替换 stdbit.h 包含为条件编译，并添加回退实现
    const fallbackCode = `/* stdbit.h compatibility patch */
#if HAVE_STDBIT_H
#include <stdbit.h>
#else
/* Fallback implementations for C23 stdbit.h functions */
static inline unsigned int stdc_count_ones(unsigned int x) {
    unsigned int count = 0;
    while (x) {
        count += x & 1;
        x >>= 1;
    }
    return count;
}

static inline unsigned int stdc_trailing_zeros(unsigned int x) {
    if (x == 0) return sizeof(x) * 8;
    unsigned int count = 0;
    while ((x & 1) == 0) {
        count++;
        x >>= 1;
    }
    return count;
}
#endif`;
    
    content = content.replace(
      '#include <stdbit.h>',
      fallbackCode
    );
    
    utils.writeFile(ffmpegDecPath, content);
    utils.printSuccess('stdbit.h 兼容性修补完成');
  }

  /**
   * 转换 main 函数为 ffmpeg_entry
   */
  convertMainFunction() {
    utils.printStep(4, '转换 ffmpeg.c main 函数');
    
    const ffmpegCPath = path.join(this.ffmpegSourcePath, 'fftools', 'ffmpeg.c');
    const outputPath = path.join(process.cwd(), 'src', 'ffmpeg_crt.c');

    if (!utils.fileExists(ffmpegCPath)) {
      throw new Error(`找不到文件: ${ffmpegCPath}`);
    }

    // 读取原始文件
    let content = utils.readFile(ffmpegCPath);

    // 替换 main 函数为 ffmpeg_entry
    const mainRegex = /int\s+main\s*\(\s*int\s+argc\s*,\s*char\s*\*\*\s*argv\s*\)/g;
    
    if (!mainRegex.test(content)) {
      throw new Error('找不到 main 函数');
    }

    // 执行替换
    content = content.replace(
      /int\s+main\s*\(\s*int\s+argc\s*,\s*char\s*\*\*\s*argv\s*\)/g,
      'int ffmpeg_entry(int argc, char **argv)'
    );

    // 添加文件头注释
    const header = `/* 
 * This file is auto-generated from FFmpeg fftools/ffmpeg.c
 * main() function has been renamed to ffmpeg_entry() for Node.js calling
 * 
 * Original file: ${ffmpegCPath}
 * Generated time: ${new Date().toISOString()}
 */

`;

    content = header + content;

    // 确保输出目录存在
    utils.ensureDir(path.dirname(outputPath));

    // 写入文件
    utils.writeFile(outputPath, content);
    utils.printSuccess(`已生成: ${outputPath}`);

    // 验证
    if (!content.includes('ffmpeg_entry')) {
      throw new Error('ffmpeg_entry 函数未找到');
    }
    
    console.log('✓ ffmpeg_crt.c 验证通过');
  }

  /**
   * 打印构建信息
   */
  printBuildInfo() {
    console.log('\n' + '='.repeat(70));
    console.log('  ✅ 构建准备完成！');
    console.log('='.repeat(70));
    console.log('\n📁 目录信息:');
    console.log(`   vcpkg 根目录: ${this.vcpkgRoot}`);
    console.log(`   FFmpeg 源码: ${this.ffmpegSourcePath}`);
    console.log(`   Triplet: ${this.triplet}`);
    
    const installedDir = path.join(this.vcpkgRoot, 'installed', this.triplet);
    console.log(`   vcpkg 库目录: ${path.join(installedDir, 'lib')}`);
    console.log(`   vcpkg 头文件: ${path.join(installedDir, 'include')}`);
    
    console.log('\n📝 下一步：');
    console.log('   运行 npm run build 编译 Node 模块');
    console.log('   或运行 node test.js 测试\n');
  }

  /**
   * 执行完整的准备流程
   */
  async run() {
    try {
      console.log('\n' + '='.repeat(70));
      console.log('  FFmpeg Node - 构建准备');
      console.log('='.repeat(70) + '\n');
      
      this.prepareSource();
      this.copyVcpkgConfig();
      this.patchStdbitHeader();
      this.convertMainFunction();
      this.printBuildInfo();
      
      return 0;
    } catch (error) {
      utils.printError(`准备失败: ${error.message}`);
      console.error(error.stack);
      return 1;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const preparer = new BuildPreparer();
  preparer.run().then(code => {
    process.exit(code);
  });
}

module.exports = BuildPreparer;

