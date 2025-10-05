import { promises as fs, createWriteStream } from 'fs'
import { Readable } from 'stream'

export const saveStreamToFile = async (
  stream: Readable,
  filePath: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(filePath)
    stream.pipe(writeStream)
    writeStream.on('finish', () => {
      resolve()
    })
    writeStream.on('error', (error) => {
      reject(error)
    })
    stream.on('error', (error) => {
      reject(error)
    })
  })
}

export async function checkFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath)
  return stats.size
}

export async function removeFile(testFilePath: string) {
  await fs.unlink(testFilePath)
}

export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
