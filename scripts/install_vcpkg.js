/**
 * vcpkg 安装脚本
 * 只负责安装 vcpkg 和 FFmpeg，不进行文件复制
 */
const path = require('path');
const utils = require('./utils');

class VcpkgInstaller {
  constructor() {
    this.vcpkgRoot = path.join(process.cwd(), 'vcpkg');
    this.vcpkgExe = utils.getVcpkgExe(this.vcpkgRoot);
    this.triplet = utils.getTriplet();
  }

  /**
   * 克隆 vcpkg 仓库
   */
  async cloneVcpkg() {
    if (utils.fileExists(this.vcpkgRoot)) {
      utils.printSuccess('vcpkg 目录已存在，跳过克隆');
      return;
    }

    console.log('克隆 vcpkg 仓库...');
    const gitExe = utils.getGitExe();
    
    try {
      utils.exec(`${gitExe} clone https://github.com/microsoft/vcpkg.git "${this.vcpkgRoot}"`);
      utils.printSuccess('vcpkg 仓库克隆完成');
    } catch (error) {
      utils.printError('vcpkg 克隆失败');
      throw error;
    }
  }

  /**
   * 初始化 vcpkg
   */
  async bootstrapVcpkg() {
    if (utils.fileExists(this.vcpkgExe)) {
      utils.printSuccess('vcpkg 已初始化，跳过 bootstrap');
      return;
    }

    console.log('初始化 vcpkg...');
    
    try {
      const bootstrapScript = utils.isWindows 
        ? path.join(this.vcpkgRoot, 'bootstrap-vcpkg.bat')
        : path.join(this.vcpkgRoot, 'bootstrap-vcpkg.sh');

      if (utils.isWindows) {
        utils.exec(`"${bootstrapScript}"`, { cwd: this.vcpkgRoot });
      } else {
        utils.exec(`chmod +x "${bootstrapScript}"`);
        utils.exec(`"${bootstrapScript}"`, { cwd: this.vcpkgRoot });
      }

      utils.printSuccess('vcpkg 初始化完成');
    } catch (error) {
      utils.printError('vcpkg 初始化失败');
      throw error;
    }
  }

  /**
   * 安装 FFmpeg 和依赖
   */
  async installFFmpeg() {
    console.log(`安装 FFmpeg (triplet: ${this.triplet})...`);

    // 检查是否已安装
    const installedDir = path.join(this.vcpkgRoot, 'installed', this.triplet);
    if (utils.fileExists(installedDir)) {
      const libDir = path.join(installedDir, 'lib');
      if (utils.fileExists(libDir)) {
        const files = require('fs').readdirSync(libDir);
        if (files.some(f => f.includes('avcodec'))) {
          utils.printSuccess('FFmpeg 已安装，跳过');
          return;
        }
      }
    }

    try {
      // vcpkg install 命令
      const features = [
        'core',
        'gpl',
        'x264',
        'avcodec',
        'avformat',
        'avfilter',
        'avdevice',
        'swscale',
        'swresample'
      ];

      const packageName = `ffmpeg[${features.join(',')}]`;
      const installCmd = `"${this.vcpkgExe}" install ${packageName}:${this.triplet}`;

      utils.exec(installCmd, { cwd: this.vcpkgRoot });
      utils.printSuccess('FFmpeg 安装完成');
    } catch (error) {
      utils.printError('FFmpeg 安装失败');
      throw error;
    }
  }

  /**
   * 验证安装
   */
  verify() {
    console.log('验证 vcpkg 安装...');

    const installedDir = path.join(this.vcpkgRoot, 'installed', this.triplet);
    const libDir = path.join(installedDir, 'lib');

    if (!utils.fileExists(libDir)) {
      throw new Error(`vcpkg 库目录不存在: ${libDir}`);
    }

    const requiredLibs = ['avcodec', 'avformat', 'avfilter', 'avutil', 'swscale', 'swresample', 'x264'];
    const missingLibs = [];
    const fs = require('fs');
    const files = fs.readdirSync(libDir);

    for (const lib of requiredLibs) {
      const found = files.some(f => f.includes(lib));
      if (!found) {
        missingLibs.push(lib);
      }
    }

    if (missingLibs.length > 0) {
      utils.printWarning(`某些库可能缺失: ${missingLibs.join(', ')}`);
      console.log('继续构建，如果失败请检查 vcpkg 安装');
    } else {
      utils.printSuccess('所有必需的库都已安装');
    }
  }

  /**
   * 执行完整的 vcpkg 安装流程
   */
  async run() {
    utils.printStep(1, '安装 vcpkg');
    
    await this.cloneVcpkg();
    await this.bootstrapVcpkg();
    await this.installFFmpeg();
    this.verify();
    
    console.log('\n✅ vcpkg 安装完成');
    console.log(`   安装目录: ${this.vcpkgRoot}`);
    console.log(`   Triplet: ${this.triplet}\n`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const installer = new VcpkgInstaller();
  installer.run().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = VcpkgInstaller;

