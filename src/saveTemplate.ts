import type { InquiryItem } from './utils'

import path from 'node:path'

import { isNullish } from 'radashi'
import { Uri, workspace } from 'vscode'

import { conversionMap, createInquiryItem, getTemplateUri, getWorkspaceFolder, isSubPath, loopInquiry, Template, templateConfig, vscodeButton } from './utils'

export async function saveTemplate(resource: Uri) {
  const workspaceFolder = await getWorkspaceFolder(resource)
  if (workspaceFolder) {
    /** 获取文件(夹)状态 */
    const stat = await workspace.fs.stat(resource)
    /** 获取配置数据 */
    const config = await templateConfig()
    type LoopType = 'name' | 'description' | 'need-save' | 'need-match' | 'match-type'
    /** 获取用户选择结果 */
    const result = await loopInquiry<LoopType>([
      createInquiryItem('input', {
        key: 'name' as LoopType,
        defaultValue: path.basename(resource.fsPath),
        options: {
          title: '请输入模板名称',
          placeholder: '模板名称',
          validateInput(value) {
            if (value) {
              return config.map(item => item.name).includes(value) ? '模板名称已存在' : void 0
            }
            return '模板名称不能为空'
          },
        },
      }),
      createInquiryItem('input', {
        key: 'description' as LoopType,
        options: { title: '请输入模板描述', placeholder: '模板描述' },
      }),
      createInquiryItem('quickPick', {
        key: 'need-save' as LoopType,
        options: {
          title: `是否另存模板文件${stat.type === 1 ? '(夹)' : ''}`,
          placeholder: '选择是否另存模板文件',
          items: [
            { label: '是', value: true, alwaysShow: true },
            { label: '否', value: false, alwaysShow: true },
          ],
        },
        defaultValue: false,
      }),
      createInquiryItem('quickPick', {
        key: 'need-match' as LoopType,
        options: {
          title: `是否创建匹配规则`,
          placeholder: '选择是否创建匹配规则',
          items: [
            { label: '是', value: true, alwaysShow: true },
            { label: '否', value: false, alwaysShow: true },
          ],
        },
        defaultValue: true,
        async customResult({ map, list, key }, _, select): Promise<any> {
          if (!isNullish(select)) {
            map.set(key, select.value)
            if (select.value) {
              list.push(createInquiryItem('quickPick', {
                key: 'match-type' as LoopType,
                options: {
                  title: `选择匹配规则类型`,
                  placeholder: '选择匹配规则类型',
                  items: [
                    { label: '字符串', value: '', alwaysShow: true, description: '匹配相同字符串' },
                    { label: '正则匹配', value: '(reg) ', alwaysShow: true, description: '使用正则表达式进行匹配' },
                  ],
                },
                defaultValue: '',
              }))
            }
            return true
          }
          return result
        },
      }),
    ])
    if (result) {
      /** 模板配置所在根目录 */
      const root = await getTemplateUri('root')
      /** 获取模板名称 */
      const name = result.get('name')
      /** 获取模板描述 */
      const description = result.get('description')
      /** 获取是否需要另存 */
      const needSave = result.get('need-save')
      /** 获取是否需要匹配 */
      const needMatch = result.get('need-match')
      /** 模板配置 */
      const template = new Template({
        name,
        description,
        type: stat.type,
      })
      if (needMatch) {
        /** 获取匹配类型 */
        const matchType = result.get('match-type')
        type RuleKey = 'key' | 'value' | 'more'
        /** 获取匹配规则的方法 */
        const getRule = (index: number): InquiryItem<number> => {
          return createInquiryItem('input', {
            key: index,
            async handling(config) {
              const parentMap = new Map<RuleKey, any>()
              const ruleMap = await loopInquiry<RuleKey>([
                createInquiryItem('input', {
                  key: 'key' as RuleKey,
                  options: {
                    title: `请输入用于匹配的${matchType ? '正则表达式' : '字符串'}(#${index})`,
                    placeholder: `按"Enter"完成创建`,
                    prompt: `示例: ${matchType ? '/^[a-z]+$/ 或 /[a-z]+/gi' : 'test 或 123'}`,
                    buttons: [vscodeButton.left, vscodeButton.cancel, vscodeButton.right],
                    validateInput(v) {
                      if ([...config.map.values()].map((map: Map<RuleKey, any>) => map.get('key')).includes(v as RuleKey)) {
                        return '匹配模式已存在'
                      }
                      else if (matchType && v && !/^\/.+\/[gimsuy]*$/.test(v)) {
                        return '请输入正确的正则表达式'
                      }
                      return void 0
                    },
                  },
                  defaultValue: (matchType ? `/${name}/g` : name),
                  async  customResult({ map, key }, _options, select) {
                    if (!isNullish(select)) {
                      map.set(key, select)
                      if (select) {
                        return true
                      }
                      return false
                    }
                    return select
                  },
                }),
                createInquiryItem('input', {
                  key: 'value' as RuleKey,
                  options: {
                    title: `请输入默认值(#${index})`,
                    placeholder: '默认值',
                    prompt: '示例: 123 或 test',
                  },
                }),
                createInquiryItem('quickPick', {
                  key: 'more' as RuleKey,
                  async options(_options, { map }) {
                    return {
                      title: `选择匹配规则类型(#${index})`,
                      placeholder: '选择匹配规则类型',
                      canSelectMany: true,
                      buttons: [vscodeButton.left, vscodeButton.right],
                      items: [
                        { label: '全大写', value: '/upcase' },
                        { label: '全小写', value: '/downcase' },
                        { label: '首字母大写', value: '/capitalize' },
                        { label: '驼峰(首字母小写)', value: '/camelcase' },
                        { label: '帕斯卡(首字母大写)', value: '/pascalcase' },
                      ].map((item) => {
                        return {
                          ...item,
                          detail: `额外匹配: ${conversionMap.get(item.value)?.(map.get('key'))}`,
                        }
                      }),
                    }
                  },
                }),
              ], { parentMap })
              if (typeof ruleMap === 'number') {
                const key = parentMap.get('key')
                if (key === '') {
                  return true
                }
                return false
              }
              config.map.set(config.key, ruleMap)
              config.list.push(getRule(index + 1))
              return true
            },
          })
        }
        /** 匹配规则 */
        const rules = await loopInquiry([getRule(1)])
        if (rules) {
          template.value = [...rules.values()].map((map: Map<RuleKey, any>) => ({
            key: map.get('key'),
            value: map.get('value'),
            more: map.get('more'),
          }))
        }
      }
      if (needSave) {
        const templateFolder = await getTemplateUri('folder')
        template.path = path.relative(root.fsPath, path.join(templateFolder.fsPath, name))
          .replaceAll(/\\|\//g, '/')
        workspace.fs.copy(resource, Uri.joinPath(root, template.path))
      }
      else {
        if (isSubPath(root.fsPath, resource.fsPath)) {
          template.path = path.relative(root.fsPath, resource.fsPath).replaceAll(/\\|\//g, '/')
        }
        else {
          /** 获取全部工作区 */
          const workspaceFolders = workspace.workspaceFolders ?? []
          /** 获取当前工作区 */
          const workspaceFolder = await getWorkspaceFolder(resource)
          if (workspaceFolder) {
            /** 设置所属工作区下标 */
            template.workspaceFolderIndex = workspaceFolders.indexOf(workspaceFolder)
            template.path = path.relative(workspaceFolder.uri.fsPath, resource.fsPath).replaceAll(/\\|\//g, '/')
          }
        }
      }
      config.push(template)
      await templateConfig(config)
    }
  }
  return null
}
