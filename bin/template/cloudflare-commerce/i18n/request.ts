import { getRequestConfig } from 'next-intl/server'

// import { headers } from 'next/headers'
import { getUserLocale } from '@/services/locale'

async function getLocaleFromIP(): Promise<string> {
  return await getUserLocale()
  // const headersList = headers()
  // const ip = headersList.get('x-forwarded-for')?.split(',')[0] || null

  // try {
  //   if (ip) {
  //     // 使用免费的IP地理位置API
  //     const response = await fetch(`http://ip-api.com/json/${ip}`)
  //     const data = await response.json<any>()

  //     // 根据国家代码返回对应的语言
  //     // 这里可以根据需求添加更多的语言映射
  //     const countryToLocale: Record<string, string> = {
  //       CN: 'zh',
  //       TW: 'zh',
  //       HK: 'zh',
  //       US: 'en',
  //       GB: 'en',
  //       // 添加更多国家映射...
  //       // North Africa (Arabic speaking countries) | 北非(阿拉伯语系国家)
  //       EG: 'ar', // Egypt | 埃及
  //       LY: 'ar', // Libya | 利比亚
  //       TN: 'ar', // Tunisia | 突尼斯
  //       DZ: 'ar', // Algeria | 阿尔及利亚
  //       MA: 'ar', // Morocco | 摩洛哥
  //       SD: 'ar', // Sudan | 苏丹

  //       // West Africa (French/English speaking) | 西非(法语/英语系国家)
  //       NG: 'en', // Nigeria | 尼日利亚
  //       GH: 'en', // Ghana | 加纳
  //       SN: 'fr', // Senegal | 塞内加尔
  //       CI: 'fr', // Ivory Coast | 科特迪瓦
  //       ML: 'fr', // Mali | 马里
  //       BF: 'fr', // Burkina Faso | 布基纳法索
  //       CM: 'fr', // Cameroon (French/English bilingual, French dominant) | 喀麦隆(法语/英语双语,以法语为主)

  //       // East Africa (English/Swahili speaking) | 东非(英语/斯瓦希里语系国家)
  //       KE: 'en', // Kenya | 肯尼亚
  //       TZ: 'en', // Tanzania | 坦桑尼亚
  //       UG: 'en', // Uganda | 乌干达
  //       RW: 'en', // Rwanda | 卢旺达
  //       ET: 'en', // Ethiopia | 埃塞俄比亚

  //       // Southern Africa (English/Portuguese speaking) | 南非(英语/葡萄牙语系国家)
  //       ZA: 'en', // South Africa | 南非
  //       NA: 'en', // Namibia | 纳米比亚
  //       BW: 'en', // Botswana | 博茨瓦纳
  //       ZM: 'en', // Zambia | 赞比亚
  //       ZW: 'en', // Zimbabwe | 津巴布韦
  //       MZ: 'pt', // Mozambique | 莫桑比克
  //       AO: 'pt', // Angola | 安哥拉
  //     }

  //     return countryToLocale[data.countryCode] || 'en' // 默认返回英语
  //   } else {
  //     const locale = await getUserLocale()
  //     return locale
  //   }
  // } catch (error) {
  //   console.error('Error detecting locale from IP:', error)
  //   const locale = await getUserLocale()
  //   return locale
  // }
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromIP()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
