import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useMediaQuery } from 'usehooks-ts'

const HOST = process.env.NEXT_PUBLIC_HOST as string

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const R2 = (path: string) => {
  return `${HOST}${path}`
}

export const randomFileName = (filename: string) => {
  return Math.random().toString(36).substring(2, 10) + '_' + filename
}

export const useIsMoble = () => {
  const matches = useMediaQuery('(max-width: 768px)')
  return matches
}

export const copyToClipboard = (text: string, toast?: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {})
      .catch(() => fallbackCopyToClipboard(text))
  } else {
    fallbackCopyToClipboard(text, toast)
  }
}

const fallbackCopyToClipboard = (text: string, toast?: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
    Toast.show({ content: `${toast ? toast + ' ' : ''}copied`, duration: 1000 })
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
    Toast.show({ content: `Failed to copy ${toast}`, duration: 1000 })
  }
  document.body.removeChild(textArea)
}

export const uploadSignedFile = async (file: File, url: string) => {
  return new Promise<Response>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      const contentType = file?.type || ''
      const fileName = file?.name || 'file'

      // Convert base64 to Blob
      const byteCharacters = atob(base64.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: contentType })

      // Create a new File from the Blob
      const newFile = new File([blob], fileName, { type: contentType })

      try {
        const response = await fetch(url, {
          method: 'PUT',
          body: newFile,
        })
        resolve(response)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    if (file) {
      reader.readAsDataURL(file as Blob)
    } else {
      reject(new Error('No valid file to read'))
    }
  })
}

export const extractImageUrl = (url: string) => {
  if (url.startsWith(HOST)) {
    return url.slice(HOST.length)
  }
  return url
}
