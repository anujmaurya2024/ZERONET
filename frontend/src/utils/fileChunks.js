export const CHUNK_SIZE = 64 * 1024; // 64KB

function readAsArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export async function readFileInChunks(file, onChunk) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${file.name}-${file.size}-${file.lastModified}`;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);
    const data = await readAsArrayBuffer(blob);
    await onChunk({
      fileId,
      fileName: file.name,
      fileSize: file.size,
      chunkIndex,
      totalChunks,
      data,
    });
  }
}

export function createFileFromChunks(chunks, fileName, fileSize) {
  const sorted = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
  const blob = new Blob(sorted.map((c) => c.data));
  return new File([blob], fileName, { type: blob.type });
}
