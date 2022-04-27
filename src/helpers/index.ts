export const b64toBlob: Function = (b64Data: string, contentType: string = '', sliceSize: number = 512): Blob => {
  const byteCharacters: string = atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  for (let offset: number = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice: string = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers: number[] = new Array(slice.length);
    for (let i: number = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray: Uint8Array = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob: Blob = new Blob(byteArrays, { type: contentType });
  return blob;
};
