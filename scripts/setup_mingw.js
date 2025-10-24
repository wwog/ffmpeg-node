#!/usr/bin/env node

/**
 * 设置 MinGW-w64 环境用于 Windows 编译
 * 检查并配置 MinGW-w64 工具链
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');

// 检查 MinGW-w64 是否已安装
function checkMinGW() {
  try {
    // 检查 gcc 是否可用
    execSync('gcc --version', { stdio: 'pipe' });
    console.log('✓ 找到 GCC 编译器');
    
    // 检查 gcc 版本
    const version = execSync('gcc --version', { encoding: 'utf8' });
    console.log('GCC 版本信息:');
    console.log(version.split('\n')[0]);
    
    return true;
  } catch (error) {
    console.log('✗ 未找到 GCC 编译器');
    return false;
  }
}

// 检查 node-gyp 是否配置为使用 MinGW
function checkNodeGypConfig() {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.node-gyp');
  const configFile = path.join(configPath, 'common.gypi');
  
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    if (content.includes('mingw') || content.includes('gcc')) {
      console.log('✓ node-gyp 已配置使用 MinGW');
      return true;
    }
  }
  
  console.log('⚠ node-gyp 可能未配置使用 MinGW');
  return false;
}

// 设置环境变量
function setEnvironment() {
  console.log('设置 MinGW 环境变量...');
  
  // 常见的 MinGW 安装路径
  const possiblePaths = [
    'C:\\msys64\\mingw64\\bin',
    'C:\\msys64\\mingw32\\bin',
    'C:\\mingw64\\bin',
    'C:\\mingw32\\bin',
    'C:\\Program Files\\mingw-w64\\x86_64-8.1.0-posix-seh-rt_v6-rev0\\mingw64\\bin',
    'C:\\Program Files (x86)\\mingw-w64\\i686-8.1.0-posix-dwarf-rt_v6-rev0\\mingw32\\bin'
  ];
  
  let mingwPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'gcc.exe'))) {
      mingwPath = testPath;
      break;
    }
  }
  
  if (mingwPath) {
    console.log(`✓ 找到 MinGW 路径: ${mingwPath}`);
    
    // 设置环境变量
    process.env.PATH = mingwPath + ';' + process.env.PATH;
    process.env.CC = 'gcc';
    process.env.CXX = 'g++';
    
    console.log('✓ 环境变量已设置');
    return true;
  } else {
    console.log('✗ 未找到 MinGW 安装');
    console.log('请安装 MinGW-w64:');
    console.log('1. 从 https://www.msys2.org/ 下载 MSYS2');
    console.log('2. 运行: pacman -S mingw-w64-x86_64-gcc');
    console.log('3. 或者从 https://www.mingw-w64.org/downloads/ 下载预编译版本');
    return false;
  }
}

// 主函数
function setupMinGW() {
  console.log('检查 MinGW-w64 环境...\n');
  
  const hasMinGW = checkMinGW();
  const hasConfig = checkNodeGypConfig();
  
  if (!hasMinGW) {
    const found = setEnvironment();
    if (!found) {
      console.log('\n❌ MinGW-w64 设置失败');
      console.log('请按照上述说明安装 MinGW-w64');
      process.exit(1);
    }
  }
  
  console.log('\n✓ MinGW-w64 环境准备就绪');
  console.log('现在可以使用以下命令编译:');
  console.log('  npm run build');
}

if (require.main === module) {
  setupMinGW();
}

module.exports = { setupMinGW, checkMinGW, setEnvironment };
