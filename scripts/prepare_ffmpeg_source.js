#!/usr/bin/env node

/**
 * 准备 FFmpeg 源码
 * 从 vcpkg 下载的压缩包中解压 FFmpeg 源码到 lib_sources 目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const libSourcesDir = path.join(rootDir, 'lib_sources');
const ffmpegTargetDir = path.join(libSourcesDir, 'ffmpeg');
const vcpkgDownloadsDir = path.join(rootDir, 'vcpkg', 'downloads');

// 查找 ffmpeg 压缩包
function findFFmpegTarball() {
  if (!fs.existsSync(vcpkgDownloadsDir)) {
    console.error('错误: vcpkg/downloads 目录不存在');
    console.error('请先运行: npm run install:vcpkg');
    process.exit(1);
  }

  const files = fs.readdirSync(vcpkgDownloadsDir);
  const ffmpegTarball = files.find(f => f.startsWith('ffmpeg-') && f.endsWith('.tar.gz'));
  
  if (!ffmpegTarball) {
    console.error('错误: 在 vcpkg/downloads 中找不到 ffmpeg 压缩包');
    console.error('请先运行: npm run install:vcpkg');
    process.exit(1);
  }

  return path.join(vcpkgDownloadsDir, ffmpegTarball);
}

// 准备源码
function prepareFFmpegSource() {
  console.log('开始准备 FFmpeg 源码...');

  // 如果目标目录已存在，跳过
  if (fs.existsSync(ffmpegTargetDir)) {
    console.log(`FFmpeg 源码已存在: ${ffmpegTargetDir}`);
    
    // 验证 fftools 目录
    const fftoolsDir = path.join(ffmpegTargetDir, 'fftools');
    if (fs.existsSync(fftoolsDir)) {
      console.log('✓ FFmpeg 源码已准备就绪');
      return;
    } else {
      console.log('源码目录不完整，重新解压...');
      fs.rmSync(ffmpegTargetDir, { recursive: true, force: true });
    }
  }

  // 创建 lib_sources 目录
  if (!fs.existsSync(libSourcesDir)) {
    fs.mkdirSync(libSourcesDir, { recursive: true });
    console.log(`创建目录: ${libSourcesDir}`);
  }

  // 查找压缩包
  const tarballPath = findFFmpegTarball();
  console.log(`找到 FFmpeg 压缩包: ${path.basename(tarballPath)}`);

  // 解压到临时目录
  console.log('正在解压...');
  try {
    execSync(`tar -xzf "${tarballPath}" -C "${libSourcesDir}"`, { 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.error('解压失败:', error.message);
    process.exit(1);
  }

  // 查找解压后的目录
  const extractedDirs = fs.readdirSync(libSourcesDir).filter(d => {
    const fullPath = path.join(libSourcesDir, d);
    return fs.statSync(fullPath).isDirectory() && d.startsWith('FFmpeg-');
  });

  if (extractedDirs.length === 0) {
    console.error('错误: 解压后找不到 FFmpeg 目录');
    process.exit(1);
  }

  const extractedDir = path.join(libSourcesDir, extractedDirs[0]);
  
  // 重命名为 ffmpeg
  fs.renameSync(extractedDir, ffmpegTargetDir);
  console.log(`重命名: ${extractedDirs[0]} -> ffmpeg`);

  // 验证
  const fftoolsDir = path.join(ffmpegTargetDir, 'fftools');
  if (!fs.existsSync(fftoolsDir)) {
    console.error('错误: fftools 目录不存在');
    process.exit(1);
  }

  const requiredFiles = [
    'cmdutils.c',
    'ffmpeg_dec.c',
    'ffmpeg_demux.c',
    'ffmpeg_enc.c',
    'ffmpeg_filter.c',
    'ffmpeg_mux.c',
    'ffmpeg_mux_init.c',
    'ffmpeg_opt.c',
    'ffmpeg_sched.c',
    'objpool.c',
    'sync_queue.c',
    'thread_queue.c'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(fftoolsDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`错误: 缺少必需文件 ${file}`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    process.exit(1);
  }

  console.log('✓ FFmpeg 源码准备完成');
  console.log(`  位置: ${ffmpegTargetDir}`);
  console.log(`  fftools: ${fftoolsDir}`);
}

// 主函数
if (require.main === module) {
  prepareFFmpegSource();
}

module.exports = { prepareFFmpegSource };

