/**
 * FFmpeg Node - 测试脚本
 */

const ffmpeg = require('./index.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('='.repeat(70));
console.log('  FFmpeg Node 测试');
console.log('='.repeat(70));
console.log('');

/**
 * 等待用户按回车继续
 */
function waitForEnter(message = '按回车键继续下一个测试...') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(message, () => {
      rl.close();
      console.log('');
      resolve();
    });
  });
}

/**
 * 测试 1: 获取版本信息
 */
function test1_version() {
  console.log('测试 1: 获取 FFmpeg 版本');
  console.log('-'.repeat(70));
  try {
    const exitCode = ffmpeg.version();
    console.log(`退出码: ${exitCode}`);
    console.log('✅ 测试通过\n');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('');
    return false;
  }
}

/**
 * 测试 2: 获取编解码器列表
 */
function test2_codecs() {
  console.log('测试 2: 获取编解码器列表（仅显示前 20 行）');
  console.log('-'.repeat(70));
  try {
    // 使用管道限制输出
    const exitCode = ffmpeg.run(['-codecs']);
    console.log(`退出码: ${exitCode}`);
    console.log('✅ 测试通过\n');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('');
    return false;
  }
}

/**
 * 测试 3: 获取格式列表
 */
function test3_formats() {
  console.log('测试 3: 获取格式列表（仅显示前 20 行）');
  console.log('-'.repeat(70));
  try {
    const exitCode = ffmpeg.run(['-formats']);
    console.log(`退出码: ${exitCode}`);
    console.log('✅ 测试通过\n');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('');
    return false;
  }
}

/**
 * 测试 4: 创建测试视频（如果没有输入文件）
 */
function test4_createTestVideo() {
  console.log('测试 4: 创建测试视频');
  console.log('-'.repeat(70));
  
  const testOutput = 'test_output.mp4';
  
  try {
    // 使用 FFmpeg 的 testsrc 生成测试视频（5秒）
    const exitCode = ffmpeg.run([
      '-f', 'lavfi',
      '-i', 'testsrc=duration=5:size=1280x720:rate=30',
      '-f', 'lavfi',
      '-i', 'sine=frequency=1000:duration=5',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-y',
      testOutput
    ]);
    
    if (fs.existsSync(testOutput)) {
      const stats = fs.statSync(testOutput);
      console.log(`✅ 测试视频已创建: ${testOutput} (${(stats.size / 1024).toFixed(2)} KB)`);
      console.log(`退出码: ${exitCode}`);
      console.log('✅ 测试通过\n');
      return true;
    } else {
      console.error('❌ 测试失败: 输出文件未创建');
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('');
    return false;
  }
}

/**
 * 测试 5: Promise API
 */
async function test5_promiseAPI() {
  console.log('测试 5: Promise API');
  console.log('-'.repeat(70));
  
  try {
    await ffmpeg.runAsync(['-version']);
    console.log('✅ Promise API 测试通过\n');
    return true;
  } catch (error) {
    console.error('❌ Promise API 测试失败:', error.message);
    console.log('');
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  const results = [];
  
  results.push(test1_version());
  await waitForEnter();
  
  results.push(test2_codecs());
  await waitForEnter();
  
  results.push(test3_formats());
  await waitForEnter();
  
  results.push(test4_createTestVideo());
  await waitForEnter();
  
  results.push(await test5_promiseAPI());
  
  console.log('='.repeat(70));
  console.log('  测试总结');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n通过: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ 所有测试通过！\n');
  } else {
    console.log('❌ 部分测试失败\n');
    process.exit(1);
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试执行出错:', error);
  process.exit(1);
});

