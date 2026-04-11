import axios, { type AxiosRequestConfig } from 'axios'

// JWT を自動付与する axios インスタンス
// orval の mutator として使用（生成されたクライアントが全リクエストでこれを使う）
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config).then(({ data }) => data)
}
