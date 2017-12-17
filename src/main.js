(function main() {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pitch = buffer.width * 4;

    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            const offset = i * 4 + j * pitch
            buffer.data[offset] = 0
            buffer.data[offset+1] = 0
            buffer.data[offset+2] = 0
            buffer.data[offset+3] = 255
        }
    }

    ctx.putImageData(buffer, 0, 0)
})()