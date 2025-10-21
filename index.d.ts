/**
 * FFmpeg Node - TypeScript 类型定义
 */

/**
 * 运行 FFmpeg 命令
 * @param args FFmpeg 命令行参数（不包括 'ffmpeg' 本身）
 * @returns 退出码（0 表示成功）
 */
export function run(args: string[]): number;

/**
 * 运行 FFmpeg 命令（Promise 版本）
 * @param args FFmpeg 命令行参数
 * @returns 返回退出码的 Promise
 */
export function runAsync(args: string[]): Promise<number>;

/**
 * 获取版本信息
 * @returns 退出码
 */
export function version(): number;

/**
 * 获取格式信息
 * @returns 退出码
 */
export function formats(): number;

/**
 * 获取编解码器信息
 * @returns 退出码
 */
export function codecs(): number;

/**
 * 获取帮助信息
 * @returns 退出码
 */
export function help(): number;

