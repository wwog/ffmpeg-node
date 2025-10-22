/*
 * FFmpeg Node - N-API Binding
 */
#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Declare ffmpeg_entry, defined in ffmpeg_crt.c */
int ffmpeg_entry(int argc, char **argv);

/*
 * Function called from JavaScript: ffmpeg.run(args)
 * args: string array, e.g. ['-i', 'input.mp4', 'output.mp4']
 */
static napi_value RunFFmpeg(napi_env env, napi_callback_info info) {
    napi_status status;
    size_t argc = 1;
    napi_value argv[1];
    napi_value result;
    
    /* Get arguments */
    status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
    if (status != napi_ok || argc < 1) {
        napi_throw_error(env, NULL, "Requires one argument: command line arguments array");
        return NULL;
    }
    
    /* Check if it's an array */
    bool is_array;
    status = napi_is_array(env, argv[0], &is_array);
    if (status != napi_ok || !is_array) {
        napi_throw_error(env, NULL, "Argument must be an array");
        return NULL;
    }
    
    /* Get array length */
    uint32_t array_length;
    status = napi_get_array_length(env, argv[0], &array_length);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Cannot get array length");
        return NULL;
    }
    
    /* Allocate C string array */
    char **c_argv = (char **)malloc(sizeof(char *) * (array_length + 1));
    if (!c_argv) {
        napi_throw_error(env, NULL, "Memory allocation failed");
        return NULL;
    }
    
    /* First argument is always program name */
    c_argv[0] = strdup("ffmpeg");
    
    /* Convert JavaScript array to C string array */
    for (uint32_t i = 0; i < array_length; i++) {
        napi_value element;
        status = napi_get_element(env, argv[0], i, &element);
        if (status != napi_ok) {
            /* Clean up allocated memory */
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "Failed to get array element");
            return NULL;
        }
        
        /* Get string length */
        size_t str_length;
        status = napi_get_value_string_utf8(env, element, NULL, 0, &str_length);
        if (status != napi_ok) {
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "Failed to get string length");
            return NULL;
        }
        
        /* Allocate and copy string */
        c_argv[i + 1] = (char *)malloc(str_length + 1);
        if (!c_argv[i + 1]) {
            for (uint32_t j = 0; j <= i; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "String memory allocation failed");
            return NULL;
        }
        
        status = napi_get_value_string_utf8(env, element, c_argv[i + 1], str_length + 1, &str_length);
        if (status != napi_ok) {
            for (uint32_t j = 0; j <= i + 1; j++) {
                free(c_argv[j]);
            }
            free(c_argv);
            napi_throw_error(env, NULL, "Failed to get string value");
            return NULL;
        }
    }
    
    /* Call ffmpeg_entry */
    int exit_code = ffmpeg_entry((int)(array_length + 1), c_argv);
    
    /* Clean up memory */
    for (uint32_t i = 0; i <= array_length; i++) {
        free(c_argv[i]);
    }
    free(c_argv);
    
    /* Return exit code */
    status = napi_create_int32(env, exit_code, &result);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Failed to create return value");
        return NULL;
    }
    
    return result;
}

/*
 * Module initialization
 */
static napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn;
    
    /* Create function */
    status = napi_create_function(env, "run", NAPI_AUTO_LENGTH, RunFFmpeg, NULL, &fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Failed to create function");
        return NULL;
    }
    
    /* Set export */
    status = napi_set_named_property(env, exports, "run", fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Failed to set export");
        return NULL;
    }
    
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
