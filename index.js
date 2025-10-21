/**
 * FFmpeg Node - JavaScript API
 */

const path = require('path');

// 加载 Native 模块
let nativeModule;
try {
  nativeModule = require('./build/Release/napi_ffmpeg.node');
} catch (err) {
  console.error(err);
  process.exit(1);

}

/**
 * 运行 FFmpeg 命令
 * @param {string[]} args - FFmpeg 命令行参数（不包括 'ffmpeg' 本身）
 * @returns {number} - 退出码（0 表示成功）
 * 
 * @example
 * const ffmpeg = require('ffmpeg-node');
 * 
 * // 转换视频
 * ffmpeg.run(['-i', 'input.mp4', '-c:v', 'libx264', 'output.mp4']);
 * 
 * // 提取音频
 * ffmpeg.run(['-i', 'video.mp4', '-vn', '-c:a', 'copy', 'audio.aac']);
 * 
 * // 使用滤镜
 * ffmpeg.run(['-i', 'input.mp4', '-vf', 'scale=1280:720', 'output.mp4']);
 */
function run(args) {
  if (!Array.isArray(args)) {
    throw new TypeError('参数必须是字符串数组');
  }

  // 确保所有参数都是字符串
  const stringArgs = args.map(arg => String(arg));

  return nativeModule.run(stringArgs);
}


/**
 * 获取版本信息
 * @returns {number} - 退出码
 */
function version() {
  return run(['-version']);
}

/**
 * 获取格式信息
 * @returns {number} - 退出码
 */
function formats() {
  return run(['-formats']);
}

/**
 * 获取编解码器信息
 * @returns {number} - 退出码
 */
function codecs() {
  return run(['-codecs']);
}

/**
 * 获取帮助信息
 * @returns {number} - 退出码
 */
function help() {
  return run(['-h']);
}

module.exports = {
  run,
  version,
  formats,
  codecs,
  help
};

