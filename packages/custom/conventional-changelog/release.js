#!/usr/bin/env node
// @ts-check

import { log } from 'node:console'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import process from 'node:process'
import checkbox from '@inquirer/checkbox'
import select, { Separator } from '@inquirer/select'
import chalk from 'chalk'
import { Command } from 'commander'
import { execa, execaSync } from 'execa'
import { tryit } from 'radashi'
import { globSync } from 'tinyglobby'
import { parse } from 'yaml'

const program = new Command()

/**
 * 读取package.json
 * @param {string} dirPath 工作区路径
 * @returns {import('type-fest').PackageJson} package.json
 */
function getPackageJson(dirPath) {
  /** package.json路径 */
  const packageJsonPath = path.join(dirPath, 'package.json')
  /** package.json文件存在 */
  if (existsSync(packageJsonPath)) {
    /** 读取package.json */
    return JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  }
  /** 返回包名 */
  return {
    name: path.basename(dirPath),
  }
}

program
  .version('1.0.0')
  .action(async () => {
    /** 工作区路径 */
    const workspacePath = path.resolve(process.cwd(), 'pnpm-workspace.yaml')
    /** 工作区文件是否存在 */
    const hasWorkspace = existsSync(workspacePath)
    if (hasWorkspace) {
      /** 读取工作区文件 */
      const workspace = readFileSync(workspacePath, 'utf-8')
      /** 解析 */
      const workspaceYaml = parse(workspace) || {}
      /** 根据工作区配置设置选项 */
      let choices = workspaceYaml.packages.map((patterns) => {
        /** 获取目录列表 */
        const dirList = globSync(patterns, { onlyDirectories: true })
          /** 格式化 */
          .map((dirPath) => {
            /** 读取package.json */
            const { name, version, description } = getPackageJson(path.resolve(process.cwd(), dirPath))
            return {
              name,
              value: dirPath,
              version,
              description,
            }
          })
          /** 过滤 */
          .filter(({ version }) => version)
        return dirList.length ? [new Separator(chalk.yellow(patterns)), ...dirList] : dirList
      })
      /** 获取主包 */
      const { name, version, description } = getPackageJson(process.cwd())
      /** 插入主包 */
      choices.unshift([
        new Separator(chalk.yellow('主包')),
        { name, value: '', version, description },
      ])
      /** 扁平 */
      choices = choices.flat()
      /** 选择 */
      const packageName = await select({
        message: '选择要发布的包',
        default: '',
        choices,
        loop: false,
      })
      /** 命令行参数 */
      const parameters = await checkbox({
        message: '是否增加版本？',
        choices: [
          {
            name: '不增加版本',
            value: '--no-increment',
          },
          {
            name: '不提交',
            value: '--no-git.commit',
          },
          {
            name: '不标记',
            value: '--no-git.tag',
          },
          {
            name: '不推送',
            value: '--no-git.push',
          },
        ],
      })
      /** 查找出选中 */
      const item = choices.find(item => item.value === packageName)
      log(chalk.yellow(`选择了${chalk.green(item.name)}`))
      log(chalk.yellow(`版本为${chalk.green(item.version)}`))
      /** 执行命令的路径 */
      const dirPath = path.resolve(process.cwd(), packageName)
      /** 配置文件相对路径 */
      const releaseItPath = path.join(path.relative(dirPath, process.cwd()), '.release-it.ts')
      /** 命令参数 */
      const args = [
        '-c',
        releaseItPath,
      ]
      if (parameters.length > 0) {
        args.push(...parameters)
      }
      /** 获取版本 */
      let npm_package_version = packageName ? `${packageName}@${item.version}` : item.version
      /** 判断版本是否存在 */
      const [result] = await tryit(() => execa('git', ['rev-parse', '--verify', npm_package_version], { reject: false }))()
      if (!result) {
        npm_package_version = void 0
      }
      /** 执行命令 */
      execaSync(
        'release-it',
        args,
        {
          stdio: 'inherit',
          cwd: dirPath,
          preferLocal: true,
          env: {
            npm_package_name: item.name,
            npm_package_version,
          },
          verbose(message) {
            log(message)
          },
        },
      )
    }
    else {
      log(chalk.blue(`未找到${chalk.green('pnpm-workspace.yaml')}，请检查`))
    }
  })

program.parse()
