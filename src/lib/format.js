const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function todayParts() {
  const now = new Date()
  return {
    date: `${now.getMonth() + 1}月${now.getDate()}日`,
    week: WEEKDAYS[now.getDay()]
  }
}
