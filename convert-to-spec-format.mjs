#!/usr/bin/env node

/**
 * 数据格式转换脚本
 *
 * 功能：把非规格格式的文件统一转换为规格格式
 * 规格格式：MM-DD-阅读理解-A.md / MM-DD-阅读理解-B.md
 *
 * 非规格格式：阅读理解_N_体裁.md
 * 转换规则：
 *   阅读理解_1_*.md → MM-DD-阅读理解-A.md
 *   阅读理解_2_*.md → MM-DD-阅读理解-B.md
 */

import { readdir, rename } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_DIR = './阅读理解/2026-阅读理解';
const SPEC_PREFIX = '阅读理解_';

async function convertDate(dateDir, dateStr) {
  const files = await readdir(dateDir);
  const conversions = [];

  // 查找要转换的文件
  const file1 = files.find((f) => f.startsWith(`${SPEC_PREFIX}1_`) && f.endsWith('.md'));
  const file1Pdf = files.find((f) => f.startsWith(`${SPEC_PREFIX}1_`) && f.endsWith('.pdf'));
  const file2 = files.find((f) => f.startsWith(`${SPEC_PREFIX}2_`) && f.endsWith('.md'));
  const file2Pdf = files.find((f) => f.startsWith(`${SPEC_PREFIX}2_`) && f.endsWith('.pdf'));

  // 检查是否已是规格格式
  const isAlreadySpec = files.some((f) => f.match(/^\d{2}-\d{2}-阅读理解-[AB]\.(md|pdf)$/));

  if (isAlreadySpec && !file1 && !file2) {
    // 已是规格格式，跳过
    return null;
  }

  if (!file1 && !file2) {
    // 没有可转换的文件
    return null;
  }

  // 转换文件 1 → A
  if (file1 && file1Pdf) {
    const newNameMd = `${dateStr}-阅读理解-A.md`;
    const newNamePdf = `${dateStr}-阅读理解-A.pdf`;
    const oldPathMd = path.join(dateDir, file1);
    const oldPathPdf = path.join(dateDir, file1Pdf);
    const newPathMd = path.join(dateDir, newNameMd);
    const newPathPdf = path.join(dateDir, newNamePdf);

    conversions.push({
      oldName: file1,
      newName: newNameMd,
      oldPathMd,
      newPathMd,
      mark: 'A',
    });

    await rename(oldPathMd, newPathMd);
    await rename(oldPathPdf, newPathPdf);
  } else if (file1 || file1Pdf) {
    conversions.push({
      mark: 'A',
      status: 'warning',
      message: '缺少 .md 或 .pdf 文件对',
    });
  }

  // 转换文件 2 → B
  if (file2 && file2Pdf) {
    const newNameMd = `${dateStr}-阅读理解-B.md`;
    const newNamePdf = `${dateStr}-阅读理解-B.pdf`;
    const oldPathMd = path.join(dateDir, file2);
    const oldPathPdf = path.join(dateDir, file2Pdf);
    const newPathMd = path.join(dateDir, newNameMd);
    const newPathPdf = path.join(dateDir, newNamePdf);

    conversions.push({
      oldName: file2,
      newName: newNameMd,
      oldPathMd,
      newPathMd,
      mark: 'B',
    });

    await rename(oldPathMd, newPathMd);
    await rename(oldPathPdf, newPathPdf);
  } else if (file2 || file2Pdf) {
    conversions.push({
      mark: 'B',
      status: 'warning',
      message: '缺少 .md 或 .pdf 文件对',
    });
  }

  return conversions.length > 0 ? conversions : null;
}

async function main() {
  try {
    console.log('📁 数据格式转换工具\n');
    console.log(`🔍 扫描源目录: ${SOURCE_DIR}\n`);

    const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
    const dateEntries = entries
      .filter((e) => e.isDirectory() && /^\d{2}-\d{2}$/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`找到 ${dateEntries.length} 个日期目录\n`);

    const stats = {
      total: dateEntries.length,
      converted: 0,
      skipped: 0,
      warnings: [],
    };

    for (const entry of dateEntries) {
      const dateDir = path.join(SOURCE_DIR, entry.name);
      const result = await convertDate(dateDir, entry.name);

      if (result === null) {
        stats.skipped++;
      } else {
        stats.converted++;
        console.log(`✅ ${entry.name}: 已转换`);

        for (const conv of result) {
          if (conv.status === 'warning') {
            console.log(`   ⚠️  ${conv.mark}: ${conv.message}`);
            stats.warnings.push(`${entry.name}-${conv.mark}: ${conv.message}`);
          } else {
            console.log(`   ${conv.mark}: ${conv.oldName} → ${conv.newName}`);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 转换统计');
    console.log('='.repeat(60));
    console.log(`总计:   ${stats.total}`);
    console.log(`转换:   ${stats.converted} ✅`);
    console.log(`跳过:   ${stats.skipped} (已是规格格式或无可转换文件)`);

    if (stats.warnings.length > 0) {
      console.log(`\n⚠️  警告 (${stats.warnings.length}):`);
      stats.warnings.slice(0, 10).forEach((w) => console.log(`   ${w}`));
      if (stats.warnings.length > 10) {
        console.log(`   ... 还有 ${stats.warnings.length - 10} 个警告`);
      }
    }

    console.log('\n✨ 转换完成！');
  } catch (err) {
    console.error(`❌ 错误: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
