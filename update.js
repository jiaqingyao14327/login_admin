function e(e, c) {
    e[0] ^= c[0],
    e[1] ^= c[1]
}
function c(c) {
    var t = [0, c[0] >>> 1];
    e(c, t),
    t[1] = c[0] >>> 1,
    e(c, t),
    t[1] = c[0] >>> 1,
    e(c, t)
}
function x64hash128(t, a) {
    var r = function(e) {
        for (var c = new Uint8Array(e.length), t = 0; t < e.length; t++) {
            var a = e.charCodeAt(t);
            if (a > 127)
                return (new TextEncoder).encode(e);
            c[t] = a
        }
        return c
    }(t);
    a = a || 0;
    var s, n = [0, r.length], i = n[1] % 16, o = n[1] - i, u = [0, a], f = [0, a], g = [0, 0], h = [0, 0];
    for (s = 0; s < o; s += 16)
        g[0] = r[s + 4] | r[s + 5] << 8 | r[s + 6] << 16 | r[s + 7] << 24,
        g[1] = r[s] | r[s + 1] << 8 | r[s + 2] << 16 | r[s + 3] << 24,
        h[0] = r[s + 12] | r[s + 13] << 8 | r[s + 14] << 16 | r[s + 15] << 24,
        h[1] = r[s + 8] | r[s + 9] << 8 | r[s + 10] << 16 | r[s + 11] << 24,
        e(u, g),
        e(f, h);
    g[0] = 0,
    g[1] = 0,
    h[0] = 0,
    h[1] = 0;
    var l = [0, 0];
    switch (i) {
    case 15:
        l[1] = r[s + 14],
        e(h, l);
    case 14:
        l[1] = r[s + 13],
        e(h, l);
    case 13:
        l[1] = r[s + 12],
        e(h, l);
    case 12:
        l[1] = r[s + 11],
        e(h, l);
    case 11:
        l[1] = r[s + 10],
        e(h, l);
    case 10:
        l[1] = r[s + 9],
        e(h, l);
    case 9:
        l[1] = r[s + 8],
        e(h, l),
        e(f, h);
    case 8:
        l[1] = r[s + 7],
        e(g, l);
    case 7:
        l[1] = r[s + 6],
        e(g, l);
    case 6:
        l[1] = r[s + 5],
        e(g, l);
    case 5:
        l[1] = r[s + 4],
        e(g, l);
    case 4:
        l[1] = r[s + 3],
        e(g, l);
    case 3:
        l[1] = r[s + 2],
        e(g, l);
    case 2:
        l[1] = r[s + 1],
        e(g, l);
    case 1:
        l[1] = r[s],
        e(g, l),
        e(u, g)
    }
    return e(u, n),
    e(f, n),
    c(u),
    c(f),
    ("00000000" + (u[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (u[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (f[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (f[1] >>> 0).toString(16)).slice(-8)
}
 function O (n) {
    var e = (new Date).getTime();
        return Math.ceil((e = (9301 * e + 49297) % 233280) / 233280 * n)
    }
function T() {
        if ("function" == typeof Uint32Array && "undefined" != typeof crypto) {
            var e = new Uint32Array(1);
            return crypto.getRandomValues(e)[0] / Math.pow(2, 32)
        }
        return O(1e19) / 1e19
    }
export function w() {
        return Date.now() + "-" + Math.floor(1e7 * T()) + "-" + T().toString(16).replace(".", "") + "-" + String(31242 * T()).replace(".", "").slice(0, 8)
    }

export function get_sessionId(){
   return x64hash128(w());
    
}