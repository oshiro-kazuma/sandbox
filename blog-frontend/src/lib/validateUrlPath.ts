const URL_PATH_REGEX = /^[a-z][a-z0-9_-]{2,29}$/

const RESERVED = [
  'api', 'admin', 'login', 'register', 'dashboard',
  'uploads', 'settings', 'u', 'me', 'static',
]

/** エラーメッセージを返す。問題なければ null */
export function validateUrlPath(path: string): string | null {
  if (!URL_PATH_REGEX.test(path)) {
    return '3〜30文字・英字始まり・英小文字/数字/ハイフン/アンダースコアのみ'
  }
  if (RESERVED.includes(path)) {
    return 'この名前は使用できません'
  }
  return null
}

/** username から url_path の候補を生成する */
export function deriveUrlPath(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[^a-z]+/, '')
    .slice(0, 30)
    .replace(/-+$/, '')
}
