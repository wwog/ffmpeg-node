/*
 * FFmpeg Node - N-API 绑定
 */
#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 声明 ffmpeg_entry，在 ffmpeg_crt.c 中定义 */
int ffmpeg_entry(int argc, char **argv);

/*
 * JavaScript 调用的函数: ffmpeg.run(args)
 * args: 字符串数组，例如 ['-i', 'input.mp4', 'output.mp4']
 */
static napi_value RunFFmpeg(napi_env env, napi_callback_info info) {
    napi_status status;
    size_t argc = 1;
    napi_value argv[1];
    napi_value result;
    
    /* 获取参数 */
    status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
    if (status != napi_ok || argc < 1) {
        napi_throw_error(env, NULL, "需要一个参数：命令行参数数组");
        return NULL;
    }
    
    /* 检查是否是数组 */
    bool is_array;
    status = napi_is_array(env, argv[0], &is_array);
    if (status != napi_ok || !is_array) {
        napi_throw_error(env, NULL, "参数必须是数组");
        return NULL;
    }
    
    /* 获取数组长度 */
    uint32_t array_length;
    status = napi_get_array_length(env, argv[0], &array_length);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "无法获取数组长度");
        return NULL;
    }
    
    /* 分配 C 字符串数组 */
    char **c_argv = (char **)malloc(sizeof(char *) * (array_length + 1));
    if (!c_argv) {
        napi_throw_error(env, NULL, "内存分配失败");
        return NULL;
    }
    
    /* 第一个参数总是程序名 */
    c_argv[0] = strdup("ffmpeg");
    
    /* 转换 JavaScript 数组到 C 字符串数组 */
    for (uint32_t i = 0; i < array_length; i++) {
        napi_value element;
        status = napi_get_element(env, argv[0], i, &element);
        if (status != napi_ok) {
            /* 清理已分配的内存 */
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "获取数组元素失败");
            return NULL;
        }
        
        /* 获取字符串长度 */
        size_t str_length;
        status = napi_get_value_string_utf8(env, element, NULL, 0, &str_length);
        if (status != napi_ok) {
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "获取字符串长度失败");
            return NULL;
        }
        
        /* 分配并复制字符串 */
        c_argv[i + 1] = (char *)malloc(str_length + 1);
        if (!c_argv[i + 1]) {
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "字符串内存分配失败");
            return NULL;
        }
        
        status = napi_get_value_string_utf8(env, element, c_argv[i + 1], str_length + 1, &str_length);
        if (status != napi_ok) {
            for (uint32_t j = 0; j <= i + 1; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "获取字符串值失败");
            return NULL;
        }
    }
    
    /* 调用 ffmpeg_entry */
    int exit_code = ffmpeg_entry((int)(array_length + 1), c_argv);
    
    /* 清理内存 */
    for (uint32_t i = 0; i <= array_length; i++) {
        free(c_argv[i]);
    }
    free(c_argv);
    
    /* 返回退出码 */
    status = napi_create_int32(env, exit_code, &result);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "创建返回值失败");
        return NULL;
    }
    
    return result;
}

/*
 * 模块初始化
 */
static napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn;
    
    /* 创建函数 */
    status = napi_create_function(env, "run", NAPI_AUTO_LENGTH, RunFFmpeg, NULL, &fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "创建函数失败");
        return NULL;
    }
    
    /* 设置导出 */
    status = napi_set_named_property(env, exports, "run", fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "设置导出失败");
        return NULL;
    }
    
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
