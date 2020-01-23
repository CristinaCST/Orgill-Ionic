#!/bin/bash
if command -v python3 &>/dev/null; then
    echo Python 3 is installed
    python3 ./build_scripts/auto_build_android.py
else
    echo Python 3 is not installed. Please install before proceding.
fi
# 
