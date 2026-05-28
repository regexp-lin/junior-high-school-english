#!/usr/bin/env node

/**
 * 数据转换预览脚本（不实际修改文件）
 * 显示将要转换的所有文件
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_DIR = './阅读理解/2026-阅读理解';
const SPEC_PREFIX = '阅读理解_';

async function previewDate(dateDir, dateStr) {
  const files = await readdir(dateDir);
  const conversions = [];

  const file1 = files.find((f) => f.startsWith(`${SPEC_PREFIX}1_`) && f.endsWith('.md'));
  const file1Pdf = files.find((f) => f.startsWith(`${SPEC_PREFIX}1_`) && f.endsWith('.pdf'));
  const file2 = files.find((f) => f.startsWith(`${SPEC_PREFIX}2_`) && f.endsWith('.md'));
  const file2Pdf = files.find((f) => f.startsWith(`${SPEC_PREFIX}2_`) && f.endsWith('.pdf'));

  const isAlreadySpec = files.some((f) => f.match(/^\d{2}-\d{2}-阅读理解-[AB]\.(md|pdf)$/));

  if (isAlreadySpec && !file1 && !file2) {
    return { status: 'already_spec', count: 0 };
  }

  if (!file1 && !file2) {
    return { status: 'no_files', count: 0 };
  }

  // 计算将要转换的文件数
  let count = 0;
  if (file1 && file1Pdf) {
    conversions.push(`  ${file1} → ${dateStr}-阅读理解-A.md`);
    conversions.push(`  ${file1Pdf} → ${dateStr}-阅读理解-A.pdf`);
    count += 2;
  }

  if (file2 && file2Pdf) {
    conversions.push(`  ${file2} → ${dateStr}-阅读理解-B.md`);
    conversions.push(`  ${file2Pdf} → ${dateStr}-阅读理解-B.pdf`);
    count += 2;
  }

  return {
    status: 'will_convert',
    count,
    details: conversions,
  };
}

async function main() {
  try {
    console.log('🔍 数据格式转换预览\n');
    console.log(`📂 源目录: ${SOURCE_DIR}\n`);

    const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
    const dateEntries = entries
      .filter((e) => e.isDirectory() && /^\d{2}-\d{2}$/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`找到 ${dateEntries.length} 个日期目录\n`);
    console.log('预览转换内容：\n');

    const stats = {
      total: dateEntries.length,
      will_convert: 0,
      already_spec: 0,
      no_files: 0,
      total_files_to_rename: 0,
      samples: [],
    };

    for (const entry of dateEntries) {
      const dateDir = path.join(SOURCE_DIR, entry.name);
      const result = await previewDate(dateDir, entry.name);

      if (result.status === 'will_convert') {
        stats.will_convert++;
        stats.total_files_to_rename += result.count;

        if (stats.samples.length < 5) {
          console.log(`${entry.name}:`);
          result.details.forEach((d) => console.log(d));
          console.log('');
          stats.samples.push(entry.name);
        }
      } else if (result.status === 'already_spec') {
        stats.already_spec++;
      } else if (result.status === 'no_files') {
        stats.no_files++;
      }
    }

    console.log('='.repeat(60));
    console.log('📊 转换预览统计');
    console.log('='.repeat(60));
    console.log(`总日期:         ${stats.total}`);
    console.log(`待转换:         ${stats.will_convert} (${stats.total_files_to_rename} 文件)`);
    console.log(`已是规格格式:   ${stats.already_spec}`);
    console.log(`无可转换文件:   ${stats.no_files}`);

    console.log(`\n📌 示例日期: ${stats.samples.join(', ')}`);
    console.log('\n执行转换: node convert-to-spec-format.mjs');
  } catch (err) {
    console.error(`❌ 错误: ${err.message}`);
    process.exit(1);
  }
}

main();
