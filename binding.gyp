{
  "targets": [
    {
      "target_name": "napi_ffmpeg",
      "sources": [
        "src/addon.c",
        "src/ffmpeg_crt.c",
        "lib_sources/ffmpeg/fftools/cmdutils.c",
        "lib_sources/ffmpeg/fftools/opt_common.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_dec.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_demux.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_enc.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_filter.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_hw.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_mux.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_mux_init.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_opt.c",
        "lib_sources/ffmpeg/fftools/ffmpeg_sched.c",
        "lib_sources/ffmpeg/fftools/objpool.c",
        "lib_sources/ffmpeg/fftools/sync_queue.c",
        "lib_sources/ffmpeg/fftools/thread_queue.c"
      ],
      "include_dirs": [
        "lib_sources/ffmpeg",
        "lib_sources/ffmpeg/fftools",
        "lib_sources/ffmpeg/compat"
      ],
      "defines": [
        "_FILE_OFFSET_BITS=64",
        "_LARGEFILE_SOURCE",
        "HAVE_STDBIT_H=0"
      ],
      "conditions": [
        ["OS=='win'", {
          "include_dirs": ["<(module_root_dir)/vcpkg/installed/x64-windows-static/include"]
        }],
        ["OS=='mac' and target_arch=='arm64'", {
          "include_dirs": ["<(module_root_dir)/vcpkg/installed/arm64-osx/include"]
        }],
        ["OS=='mac' and target_arch=='x64'", {
          "include_dirs": ["<(module_root_dir)/vcpkg/installed/x64-osx/include"]
        }],
        ["OS=='linux'", {
          "include_dirs": ["<(module_root_dir)/vcpkg/installed/x64-linux/include"]
        }],
        [
          "OS==\"win\"",
          {
            "libraries": [
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/avcodec.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/avformat.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/avfilter.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/avdevice.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/avutil.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/swscale.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/swresample.lib",
              "<(module_root_dir)/vcpkg/installed/x64-windows-static/lib/libx264.lib"
            ],
            "defines": [
              "WIN32",
              "_WINDOWS",
              "_CRT_SECURE_NO_WARNINGS"
            ],
            "cflags": [
              "-std=c11",
              "-D__STDC_VERSION__=201112L"
            ],
            "ldflags": [
              "-static-libgcc",
              "-static-libstdc++"
            ],
            "conditions": [
              ["target_arch=='x64'", {
                "cflags": ["-m64"],
                "ldflags": ["-m64"]
              }],
              ["target_arch=='ia32'", {
                "cflags": ["-m32"],
                "ldflags": ["-m32"]
              }]
            ]
          }
        ],
        [
          "OS==\"mac\" and target_arch==\"arm64\"",
          {
            "libraries": [
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libavcodec.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libavformat.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libavfilter.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libavdevice.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libavutil.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libswscale.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libswresample.a",
              "<(module_root_dir)/vcpkg/installed/arm64-osx/lib/libx264.a"
            ],
            "xcode_settings": {
              "OTHER_CFLAGS": [
                "-std=c11"
              ],
              "OTHER_LDFLAGS": [
                "-framework CoreFoundation",
                "-framework CoreVideo",
                "-framework CoreMedia",
                "-framework VideoToolbox",
                "-framework AudioToolbox",
                "-framework OpenGL",
                "-framework AppKit",
                "-framework CoreGraphics",
                "-framework Security",
                "-lz",
                "-lbz2",
                "-liconv",
                "-lm"
              ]
            }
          }
        ],
        [
          "OS==\"mac\" and target_arch==\"x64\"",
          {
            "libraries": [
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libavcodec.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libavformat.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libavfilter.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libavdevice.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libavutil.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libswscale.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libswresample.a",
              "<(module_root_dir)/vcpkg/installed/x64-osx/lib/libx264.a"
            ],
            "xcode_settings": {
              "OTHER_CFLAGS": [
                "-std=c11"
              ],
              "OTHER_LDFLAGS": [
                "-framework CoreFoundation",
                "-framework CoreVideo",
                "-framework CoreMedia",
                "-framework VideoToolbox",
                "-framework AudioToolbox",
                "-framework OpenGL",
                "-framework AppKit",
                "-framework CoreGraphics",
                "-framework Security",
                "-lz",
                "-lbz2",
                "-liconv",
                "-lm"
              ]
            }
          }
        ],
        [
          "OS==\"linux\"",
          {
            "libraries": [
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libavcodec.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libavformat.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libavfilter.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libavdevice.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libavutil.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libswscale.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libswresample.a",
              "<(module_root_dir)/vcpkg/installed/x64-linux/lib/libx264.a"
            ],
            "cflags": [
              "-std=c11"
            ],
            "ldflags": [
              "-lz",
              "-lm",
              "-lpthread",
              "-ldl"
            ]
          }
        ]
      ]
    }
  ]
}

