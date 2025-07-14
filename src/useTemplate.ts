import type { Uri } from 'vscode'

import type { Template } from './utils'

import { window } from 'vscode'

import { createInquiryItem, getWorkspaceFolder, logs, loopInquiry, templateConfig } from './utils'

export async function useTemplate(resource: Uri) {
  const workspaceFolder = await getWorkspaceFolder(resource)
  if (workspaceFolder) {
    /** 获取配置数据 */
    const config = await templateConfig()
    if (!config.length) {
      window.showWarningMessage(
        '请先配置模板',
        { modal: true },
      )
      logs.warn('请先配置模板')
      return null
    }
    type LoopType = 'select'
    const result = await loopInquiry([
      createInquiryItem('quickPick', {
        key: 'select' as LoopType,
        options: {
          title: '请选择模板',
          placeholder: '请选择模板',
          items: config.map(item => ({
            disabled: !item.exists,
            label: item.name,
            description: item.description || void 0,
            value: item,
            detail: item.detail,
          })),
        },
      }),
    ])
    if (result) {
      const template: Template = result.get('select')
      const map = await loopInquiry(template.value.map(({ key, value }, i) => createInquiryItem('input', {
        key: i,
        options: {
          title: `打算把 ${key} 替换为什么`,
          placeholder: `请输入 ${key} 的替换值`,
        },
        defaultValue: value,
      })))
      if (map) {
        map.forEach((value, key) => {
          template.value[key].value = value
        })
      }
      template.copy(resource)
    }
  }
  return null
}
