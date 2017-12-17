class Vector3 {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.value = [x, y, z]
        this.x = x
        this.y = y
        this.z = z
    }

    /**
     * add two vector3 return a new vector3
     * @param {Vector3} v 
     * @returns {Vector3}
     */
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
    }

    /**
     * sub two vector3 return a new vector3
     * @param {Vector3} v 
     * @returns {Vector3}
     */
    sub(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    /**
     * dot two vector3 return a number
     * @param {Vector3} v 
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
}

class Sphere {
    /**
     * @param {Vector3} center 
     * @param {number} radius 
     * @param {?} color 
     */
    constructor(center, radius, color) {
        this.center = center
        this.radius = radius
        this.color = color
    }
}

class Scene {
    constructor() {
        this.spheres = []
    }

    /**
     * @param {Sphere} sphere
     * @return {Scene}
     */
    addSphere(sphere) {
        this.spheres.push(sphere)
        return this
    }
}

/**
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @return {Vector3}
 */
function v3(x, y, z) {
    return new Vector3(x, y, z)
}


(function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pitch = buffer.width * 4;

    function putPixel(x, y, color) {
        x = canvas.width * 0.5 + x
        y = canvas.height * 0.5 - y

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return
        }

        const offset = x * 4 + y * pitch
        buffer.data[offset] = color[0]
        buffer.data[offset+1] = color[1]
        buffer.data[offset+2] = color[2]
        buffer.data[offset+3] = 255
    }

    const scene = new Scene()
    scene.addSphere(new Sphere(v3(0, -1, 3), 1, [255, 0, 0]))
        .addSphere(new Sphere(v3(2, 0, 4), 1, [0, 0, 255]))
        .addSphere(new Sphere(v3(-2, 0, 4), 1, [0, 255, 0]))
    const cameraPosition = v3(0, 0, 0)
    const viewportSize = 1
    const projectionDepth = 1
    const backgroundColor = [255, 255, 255]

    /**
     * convert canvas coord to viewport coord
     * @param {numver} x 
     * @param {number} y 
     * @return {Vector3}
     */
    function canvasToViewport(x, y) {
        return v3(x * viewportSize / canvas.width, y * viewportSize / canvas.height, projectionDepth)
    }

    /**
     * 
     * @param {Vector3} o 
     * @param {Vector3} dir 
     * @param {Sphere} sphere 
     */
    function intersetRaySphere(o, dir, sphere) {
        const oc = o.sub(sphere.center)
        const a = dir.dot(dir)
        const b = 2 * oc.dot(dir)
        const c = oc.dot(oc) - sphere.radius * sphere.radius
        const delta = b * b - 4 * a * c
        if (delta < 0) {
            return [Infinity, Infinity]
        }

        const sd = Math.sqrt(delta)
        const t1 = (-b + sd) / (2 * a)
        const t2 = (-b - sd) / (2 * a)
        return [t1, t2]
    }

    function traceRay(o, dir, tMin, tMax) {
        let closestT = Infinity
        let closestSphere = null
        scene.spheres.forEach(sphere => {
            const t = intersetRaySphere(o, dir, sphere)
            if (t[0] < closestT && t[0] > tMin && t[0] < tMax) {
                closestT = t[0]
                closestSphere = sphere
            }
            if (t[1] < closestT && t[1] > tMin && t[1] < tMax) {
                closestT = t[1]
                closestSphere = sphere
            }
        })
        if (closestSphere == null) {
            return backgroundColor
        }
        return closestSphere.color
    }


    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
        for (let y = -canvas.height / 2 + 1; y <= canvas.height / 2; y++) {
            let viewportCoord = canvasToViewport(x, y)
            let color = traceRay(cameraPosition, viewportCoord.sub(cameraPosition), 1, Infinity)
            putPixel(x, y, color)
        }
    }

    ctx.putImageData(buffer, 0, 0)
})()