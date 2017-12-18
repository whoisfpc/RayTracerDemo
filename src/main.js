class Vector3 {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    /**
     * return a zero vector
     * @returns {Vector3}
     */
    static zero() {
        return new Vector3(0, 0, 0)
    }

    /**
     * return a one vector
     * @returns {Vector3}
     */
    static one() {
        return new Vector3(1, 1, 1)
    }

    /**
     * return a vector, flip every axis
     * @returns {Vector3}
     */
    flip() {
        return new Vector3(-this.x, -this.y, -this.z)
    }

    /**
     * @returns {number}
     */
    lenght() {
        return Math.sqrt(this.dot(this))
    }

    /**
     * return a normalized vector of this
     * @returns {Vector3}
     */
    normalized() {
        return this.scale(1/this.lenght())
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
     * mul two vector3 return a new vector3
     * @param {Vector3} v 
     */
    mul(v) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z)
    }

    /**
     * scale vector with t and return a new vector
     * @param {number} t 
     * @returns {Vector3}
     */
    scale(t) {
        return new Vector3(this.x * t, this.y * t, this.z * t)
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
     * @param {Vector3} color 
     * @param {number} specular
     */
    constructor(center, radius, color, specular) {
        this.center = center
        this.radius = radius
        this.color = color
        this.specular = specular
    }
}

const LightType = {
    ambient: 0,
    point: 1,
    directional: 2
}

class Light {
    /**
     * 
     * @param {number} type 
     * @param {number} intensity 
     * @param {Vector3} position 
     * @param {Vector3} direction 
     */
    constructor(type, intensity, position, direction) {
        if (!type) {
            type = 0
        }
        this.type = type
        this.intensity = intensity
        this.position = position || Vector3.zero()
        this.direction = direction || Vector3.one()
    }
}

class Scene {
    constructor() {
        /** @type {Sphere[]} */
        this.spheres = []
        /** @type {Light[]} */
        this.lights = []
    }

    /**
     * @param {Sphere} sphere
     * @return {Scene}
     */
    addSphere(sphere) {
        this.spheres.push(sphere)
        return this
    }

    /**
     * @param {Light} light 
     * @returns {Scene}
     */
    addLight(light) {
        this.lights.push(light)
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
    const pitch = buffer.width * 4

    /**
     * put a pixel on (x, y) with color
     * @param {number} x 
     * @param {number} y 
     * @param {Vector3} color 
     */
    function putPixel(x, y, color) {
        x = canvas.width * 0.5 + x
        y = canvas.height * 0.5 - y

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            return
        }

        const offset = x * 4 + y * pitch
        buffer.data[offset] = color.x
        buffer.data[offset+1] = color.y
        buffer.data[offset+2] = color.z
        buffer.data[offset+3] = 255
    }

    const scene = new Scene()
    scene.addSphere(new Sphere(v3(0, -1, 3), 1, v3(255, 0, 0), 500))
        .addSphere(new Sphere(v3(2, 0, 4), 1, v3(0, 0, 255), 500))
        .addSphere(new Sphere(v3(-2, 0, 4), 1, v3(0, 255, 0), 10))
        .addSphere(new Sphere(v3(0, -5001, 0), 5000, v3(255, 255, 0), 1000))
        .addLight(new Light(LightType.ambient, 0.2))
        .addLight(new Light(LightType.point, 0.6, v3(2, 1, 0)))
        .addLight(new Light(LightType.directional, 0.2, null, v3(1, 4, 4)))
    const cameraPosition = v3(0, 0, 0)
    const viewportSize = 1
    const projectionDepth = 1
    const backgroundColor = v3(255, 255, 255)

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
     * @returns {Array}
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

    /**
     * reach closest interset sphere and point
     * @param {Vector3} o 
     * @param {Vector3} dir 
     * @param {number} tMin 
     * @param {number} tMax 
     * @returns {{closestSphere: Sphere, closestT: number}} closestInterset
     */
    function closestInterset(o, dir, tMin, tMax) {
        let closestT = Infinity
        /** @type {Sphere} */
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
        return {sphere: closestSphere, t: closestT}
    }

    /**
     * compute light intensity at point `p`
     * @param {Vector3} p 
     * @param {Vector3} n 
     * @param {Vector3} v 
     * @param {number} s 
     * @returns {number}
     */
    function computeLighting(p, n, v, s) {
        let intensity = 0
        scene.lights.forEach(light => {
            if (light.type === LightType.ambient) {
                intensity += light.intensity
            } else {
                let l
                let tMax
                if (light.type === LightType.point) {
                    l = light.position.sub(p)
                    tMax = 1
                } else {
                    l = light.direction
                    tMax = Infinity
                }
                // shadow check
                const {sphere: shadowSphere} = closestInterset(p, l, 0.001, tMax)
                if (shadowSphere) {
                    return
                }
                // compute diffuse
                const ndotl = n.dot(l)
                if (ndotl > 0) {
                    intensity += light.intensity * ndotl / (n.lenght() * l.lenght())
                }

                // compute specular
                if (s != -1) {
                    const r = n.scale(2 * ndotl).sub(l)
                    const rdotv = r.dot(v)
                    if (rdotv > 0) {
                        intensity += light.intensity * Math.pow(rdotv / (r.lenght() * v.lenght()), s)
                    }
                }
            }
        })
        return intensity
    }

    /**
     * 
     * @param {Vector3} o 
     * @param {Vector3} dir 
     * @param {number} tMin 
     * @param {number} tMax 
     * @returns {Vector3}
     */
    function traceRay(o, dir, tMin, tMax) {
        const {sphere: closestSphere, t: closestT} = closestInterset(o, dir, tMin, tMax)
        if (closestSphere == null) {
            return backgroundColor
        }
        const p = o.add(dir.scale(closestT))
        const n = p.sub(closestSphere.center).normalized()
        const v = dir.flip().normalized()
        return closestSphere.color.scale(computeLighting(p, n, v, closestSphere.specular))
    }

    function clamp(color) {
        return v3(Math.min(255, Math.max(0, color.x)),
            Math.min(255, Math.max(0, color.y)),
            Math.min(255, Math.max(0, color.z)))
    }

    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
        for (let y = -canvas.height / 2 + 1; y <= canvas.height / 2; y++) {
            let viewportCoord = canvasToViewport(x, y)
            let color = traceRay(cameraPosition, viewportCoord.sub(cameraPosition), 1, Infinity)
            putPixel(x, y, clamp(color))
        }
    }

    ctx.putImageData(buffer, 0, 0)
})()