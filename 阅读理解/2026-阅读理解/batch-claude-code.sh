#!/bin/bash
prompts=(
  "使用 skills 生成 03-26 的阅读理解"
  "使用 skills 生成 03-27 的阅读理解"
  "使用 skills 生成 03-28 的阅读理解"
  "使用 skills 生成 03-29 的阅读理解"
  "使用 skills 生成 03-30 的阅读理解"
)

for p in "${prompts[@]}"; do
  echo "======================================"
  echo "[Claude] 正在执行: $p"
  
  # 使用 -p 传入指令，并添加 --dangerously-skip-permissions 参数以跳过交互式权限询问
  claude -p "$p" --dangerously-skip-permissions
  
  sleep 3 # 停顿缓冲
done
echo "✅ 所有 Claude 任务执行完毕"