export const splitListIntoChunks = <T>(list: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  const listCopy = [...list]

  while (listCopy.length) {
    chunks.push(listCopy.splice(0, chunkSize))
  }

  return chunks
}
