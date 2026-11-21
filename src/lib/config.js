export const APP_VERSION = '1.0.6'

// 安装包直链：放在 GitHub Pages 上，国内一般不用 VPN 就能下载
export const APP_DOWNLOAD_URL = 'https://cnliyh.github.io/woyaochumen/woyaochumen.apk'

// 备用线路：jsDelivr 加速同一份文件
export const APP_DOWNLOAD_BACKUP =
  'https://cdn.jsdelivr.net/gh/cnliyh/woyaochumen@main/release/woyaochumen.apk'

// 已授权设备码名单：仓库里的 public/licenses.json 由作者维护
export const LICENSE_LIST_URLS = [
  'https://cnliyh.github.io/woyaochumen/licenses.json',
  'https://cdn.jsdelivr.net/gh/cnliyh/woyaochumen@main/public/licenses.json'
]

// 付款后联系作者的方式（微信号 / 邮箱），留空则只显示「发给作者」
export const CONTACT = ''

// 支付宝收款链接（由收款码解析得到），点按钮可直接唤起支付宝
export const PAY_URL = 'https://qr.alipay.com/2m611990ld77s7iqe9kje95'

// 作者设备码：只有这些设备能看到管理员入口
export const ADMIN_CODES = ['6ZJV-M5NZ']

// 授权名单所在仓库
export const GITHUB_REPO = 'cnliyh/woyaochumen'

// 内购价格（元）
export const PRICE = '6.6'

// App 免费试用天数
export const TRIAL_DAYS = 90
