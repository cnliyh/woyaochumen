export const SCENARIOS = [
  {
    id: 'swim',
    name: '游泳',
    icon: 'wave',
    tone: 'aqua',
    groups: [
      { id: 'papers', name: '证件与贵重', items: ['手机', '身份证'] },
      { id: 'gear', name: '泳具', items: ['泳衣 / 泳裤', '泳镜', '泳帽', '防水袋'] },
      { id: 'wash', name: '洗漱', items: ['毛巾', '沐浴露', '洗发水', '拖鞋'] },
      { id: 'clothes', name: '衣物与其他', items: ['换洗衣物', '水杯'] }
    ]
  },
  {
    id: 'hiking',
    name: '爬山',
    icon: 'mountain',
    tone: 'forest',
    groups: [
      { id: 'papers', name: '证件与贵重', items: ['手机', '身份证', '充电宝'] },
      { id: 'wear', name: '穿戴', items: ['登山鞋', '速干衣', '外套', '雨衣'] },
      {
        id: 'supply',
        name: '装备与补给',
        items: ['登山杖', '双肩包', '饮用水', '能量补给', '纸巾']
      }
    ]
  },
  {
    id: 'camping',
    name: '露营',
    icon: 'tent',
    tone: 'earth',
    groups: [
      { id: 'papers', name: '证件与贵重', items: ['手机', '身份证', '充电宝'] },
      { id: 'stay', name: '住宿', items: ['帐篷', '睡袋', '防潮垫', '营地灯'] },
      { id: 'cook', name: '炊事', items: ['炉具', '食材', '饮用水'] },
      { id: 'other', name: '其他', items: ['驱蚊液', '垃圾袋'] }
    ]
  },
  {
    id: 'business',
    name: '出差',
    icon: 'briefcase',
    tone: 'slate',
    groups: [
      { id: 'papers', name: '证件与贵重', items: ['手机', '身份证', '名片', '充电宝'] },
      { id: 'office', name: '办公', items: ['笔记本电脑', '充电器'] },
      { id: 'wash', name: '洗漱与衣物', items: ['洗漱包', '换洗衣物'] },
      { id: 'other', name: '其他', items: ['雨伞', '常用药'] }
    ]
  },
  {
    id: 'gym',
    name: '健身',
    icon: 'dumbbell',
    tone: 'coral',
    groups: [
      { id: 'papers', name: '证件与贵重', items: ['手机', '会员卡'] },
      { id: 'train', name: '训练', items: ['运动服', '运动鞋', '毛巾', '水杯', '耳机'] },
      { id: 'clothes', name: '衣物', items: ['换洗衣物'] }
    ]
  }
]

export function getScenario(id) {
  return SCENARIOS.find((item) => item.id === id) || null
}

export function scenarioCount(scenario, lists) {
  const groups = lists[scenario.id] || {}
  return Object.values(groups).reduce((sum, items) => sum + items.length, 0)
}
