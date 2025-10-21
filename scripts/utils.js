/**
 * 构建工具函数
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BuildUtils {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform === 'linux';
  }

  /**
   * 获取平台相关的 triplet
   */
  getTriplet() {
    if (this.isWindows) {
      return 'x64-windows-static';
    } else if (this.isMac) {
      return os.arch() === 'arm64' ? 'arm64-osx' : 'x64-osx';
    } else {
      return 'x64-linux';
    }
  }

  /**
   * 执行命令并打印输出
   */
  exec(command, options = {}) {
    console.log(`\n执行命令: ${command}`);
    try {
      const result = execSync(command, {
        stdio: 'inherit',
        shell: true,
        ...options
      });
      return result;
    } catch (error) {
      console.error(`命令执行失败: ${command}`);
      throw error;
    }
  }

  /**
   * 执行命令并返回输出
   */
  execOutput(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        shell: true,
        ...options
      }).trim();
    } catch (error) {
      console.error(`命令执行失败: ${command}`);
      throw error;
    }
  }

  /**
   * 异步执行命令（用于长时间运行的任务）
   */
  execAsync(command, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`\n执行命令: ${command}`);
      const child = spawn(command, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`命令退出码: ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * 确保目录存在
   */
  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`创建目录: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 复制文件
   */
  copyFile(src, dest) {
    this.ensureDir(path.dirname(dest));
    console.log(`复制: ${src} -> ${dest}`);
    fs.copyFileSync(src, dest);
  }

  /**
   * 递归复制目录
   */
  copyDir(src, dest) {
    this.ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        this.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 读取文件
   */
  readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * 写入文件
   */
  writeFile(filePath, content) {
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * 检查文件是否存在
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * 删除文件或目录
   */
  remove(targetPath) {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
      console.log(`已删除: ${targetPath}`);
    }
  }

  /**
   * 打印步骤标题
   */
  printStep(step, message) {
    const separator = '='.repeat(60);
    console.log(`\n${separator}`);
    console.log(`步骤 ${step}: ${message}`);
    console.log(`${separator}\n`);
  }

  /**
   * 打印成功消息
   */
  printSuccess(message) {
    console.log(`\n✅ ${message}\n`);
  }

  /**
   * 打印错误消息
   */
  printError(message) {
    console.error(`\n❌ ${message}\n`);
  }

  /**
   * 打印警告消息
   */
  printWarning(message) {
    console.warn(`\n⚠️  ${message}\n`);
  }

  /**
   * 获取 vcpkg 可执行文件路径
   */
  getVcpkgExe(vcpkgRoot) {
    return path.join(vcpkgRoot, this.isWindows ? 'vcpkg.exe' : 'vcpkg');
  }

  /**
   * 获取 Git 可执行文件
   */
  getGitExe() {
    return this.isWindows ? 'git.exe' : 'git';
  }
}

module.exports = new BuildUtils();

