var window = window || {};
var navigator = navigator|| {};
$ = window.$ || {};
var CryptoJS = CryptoJS ||
function(K, C) {
    var F = {},
    E = F.lib = {},
    M = function() {},
    L = E.Base = {
        extend: function(N) {
            M.prototype = this;
            var O = new M;
            N && O.mixIn(N);
            O.hasOwnProperty("init") || (O.init = function() {
                O.$super.init.apply(this, arguments)
            });
            O.init.prototype = O;
            O.$super = this;
            return O
        },
        create: function() {
            var N = this.extend();
            N.init.apply(N, arguments);
            return N
        },
        init: function() {},
        mixIn: function(N) {
            for (var O in N) {
                N.hasOwnProperty(O) && (this[O] = N[O])
            }
            N.hasOwnProperty("toString") && (this.toString = N.toString)
        },
        clone: function() {
            return this.init.prototype.extend(this)
        }
    },
    A = E.WordArray = L.extend({
        init: function(N, O) {
            N = this.words = N || [];
            this.sigBytes = O != C ? O: 4 * N.length
        },
        toString: function(N) {
            return (N || J).stringify(this)
        },
        concat: function(N) {
            var R = this.words,
            Q = N.words,
            P = this.sigBytes;
            N = N.sigBytes;
            this.clamp();
            if (P % 4) {
                for (var O = 0; O < N; O++) {
                    R[P + O >>> 2] |= (Q[O >>> 2] >>> 24 - 8 * (O % 4) & 255) << 24 - 8 * ((P + O) % 4)
                }
            } else {
                if (65535 < Q.length) {
                    for (O = 0; O < N; O += 4) {
                        R[P + O >>> 2] = Q[O >>> 2]
                    }
                } else {
                    R.push.apply(R, Q)
                }
            }
            this.sigBytes += N;
            return this
        },
        clamp: function() {
            var N = this.words,
            O = this.sigBytes;
            N[O >>> 2] &= 4294967295 << 32 - 8 * (O % 4);
            N.length = K.ceil(O / 4)
        },
        clone: function() {
            var N = L.clone.call(this);
            N.words = this.words.slice(0);
            return N
        },
        random: function(N) {
            for (var P = [], O = 0; O < N; O += 4) {
                P.push(4294967296 * K.random() | 0)
            }
            return new A.init(P, N)
        }
    }),
    I = F.enc = {},
    J = I.Hex = {
        stringify: function(N) {
            var R = N.words;
            N = N.sigBytes;
            for (var Q = [], P = 0; P < N; P++) {
                var O = R[P >>> 2] >>> 24 - 8 * (P % 4) & 255;
                Q.push((O >>> 4).toString(16));
                Q.push((O & 15).toString(16))
            }
            return Q.join("")
        },
        parse: function(N) {
            for (var Q = N.length,
            P = [], O = 0; O < Q; O += 2) {
                P[O >>> 3] |= parseInt(N.substr(O, 2), 16) << 24 - 4 * (O % 8)
            }
            return new A.init(P, Q / 2)
        }
    },
    G = I.Latin1 = {
        stringify: function(N) {
            var Q = N.words;
            N = N.sigBytes;
            for (var P = [], O = 0; O < N; O++) {
                P.push(String.fromCharCode(Q[O >>> 2] >>> 24 - 8 * (O % 4) & 255))
            }
            return P.join("")
        },
        parse: function(N) {
            for (var Q = N.length,
            P = [], O = 0; O < Q; O++) {
                P[O >>> 2] |= (N.charCodeAt(O) & 255) << 24 - 8 * (O % 4)
            }
            return new A.init(P, Q)
        }
    },
    H = I.Utf8 = {
        stringify: function(N) {
            try {
                return decodeURIComponent(escape(G.stringify(N)))
            } catch(O) {
                throw Error("Malformed UTF-8 data")
            }
        },
        parse: function(N) {
            return G.parse(unescape(encodeURIComponent(N)))
        }
    },
    B = E.BufferedBlockAlgorithm = L.extend({
        reset: function() {
            this._data = new A.init;
            this._nDataBytes = 0
        },
        _append: function(N) {
            "string" == typeof N && (N = H.parse(N));
            this._data.concat(N);
            this._nDataBytes += N.sigBytes
        },
        _process: function(O) {
            var T = this._data,
            S = T.words,
            Q = T.sigBytes,
            P = this.blockSize,
            N = Q / (4 * P),
            N = O ? K.ceil(N) : K.max((N | 0) - this._minBufferSize, 0);
            O = N * P;
            Q = K.min(4 * O, Q);
            if (O) {
                for (var R = 0; R < O; R += P) {
                    this._doProcessBlock(S, R)
                }
                R = S.splice(0, O);
                T.sigBytes -= Q
            }
            return new A.init(R, Q)
        },
        clone: function() {
            var N = L.clone.call(this);
            N._data = this._data.clone();
            return N
        },
        _minBufferSize: 0
    });
    E.Hasher = B.extend({
        cfg: L.extend(),
        init: function(N) {
            this.cfg = this.cfg.extend(N);
            this.reset()
        },
        reset: function() {
            B.reset.call(this);
            this._doReset()
        },
        update: function(N) {
            this._append(N);
            this._process();
            return this
        },
        finalize: function(N) {
            N && this._append(N);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(N) {
            return function(O, P) {
                return (new N.init(P)).finalize(O)
            }
        },
        _createHmacHelper: function(N) {
            return function(O, P) {
                return (new D.HMAC.init(N, P)).finalize(O)
            }
        }
    });
    var D = F.algo = {};
    return F
} (Math); (function() {
    var A = CryptoJS,
    B = A.lib.WordArray;
    A.enc.Base64 = {
        stringify: function(I) {
            var D = I.words,
            H = I.sigBytes,
            F = this._map;
            I.clamp();
            I = [];
            for (var G = 0; G < H; G += 3) {
                for (var C = (D[G >>> 2] >>> 24 - 8 * (G % 4) & 255) << 16 | (D[G + 1 >>> 2] >>> 24 - 8 * ((G + 1) % 4) & 255) << 8 | D[G + 2 >>> 2] >>> 24 - 8 * ((G + 2) % 4) & 255, E = 0; 4 > E && G + 0.75 * E < H; E++) {
                    I.push(F.charAt(C >>> 6 * (3 - E) & 63))
                }
            }
            if (D = F.charAt(64)) {
                for (; I.length % 4;) {
                    I.push(D)
                }
            }
            return I.join("")
        },
        parse: function(J) {
            var E = J.length,
            H = this._map,
            G = H.charAt(64);
            G && (G = J.indexOf(G), -1 != G && (E = G));
            for (var G = [], I = 0, D = 0; D < E; D++) {
                if (D % 4) {
                    var F = H.indexOf(J.charAt(D - 1)) << 2 * (D % 4),
                    C = H.indexOf(J.charAt(D)) >>> 6 - 2 * (D % 4);
                    G[I >>> 2] |= (F | C) << 24 - 8 * (I % 4);
                    I++
                }
            }
            return B.create(G, I)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
})(); (function(I) {
    function B(L, R, M, Q, P, O, N) {
        L = L + (R & M | ~R & Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function D(L, R, M, Q, P, O, N) {
        L = L + (R & Q | M & ~Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function C(L, R, M, Q, P, O, N) {
        L = L + (R ^ M ^ Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function K(L, R, M, Q, P, O, N) {
        L = L + (M ^ (R | ~Q)) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    for (var J = CryptoJS,
    A = J.lib,
    G = A.WordArray,
    H = A.Hasher,
    A = J.algo,
    E = [], F = 0; 64 > F; F++) {
        E[F] = 4294967296 * I.abs(I.sin(F + 1)) | 0
    }
    A = A.MD5 = H.extend({
        _doReset: function() {
            this._hash = new G.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function(W, Y) {
            for (var AB = 0; 16 > AB; AB++) {
                var AA = Y + AB,
                y = W[AA];
                W[AA] = (y << 8 | y >>> 24) & 16711935 | (y << 24 | y >>> 8) & 4278255360
            }
            var AB = this._hash.words,
            AA = W[Y + 0],
            y = W[Y + 1],
            l = W[Y + 2],
            b = W[Y + 3],
            L = W[Y + 4],
            U = W[Y + 5],
            R = W[Y + 6],
            N = W[Y + 7],
            O = W[Y + 8],
            X = W[Y + 9],
            V = W[Y + 10],
            T = W[Y + 11],
            P = W[Y + 12],
            S = W[Y + 13],
            Q = W[Y + 14],
            M = W[Y + 15],
            s = AB[0],
            Z = AB[1],
            p = AB[2],
            o = AB[3],
            s = B(s, Z, p, o, AA, 7, E[0]),
            o = B(o, s, Z, p, y, 12, E[1]),
            p = B(p, o, s, Z, l, 17, E[2]),
            Z = B(Z, p, o, s, b, 22, E[3]),
            s = B(s, Z, p, o, L, 7, E[4]),
            o = B(o, s, Z, p, U, 12, E[5]),
            p = B(p, o, s, Z, R, 17, E[6]),
            Z = B(Z, p, o, s, N, 22, E[7]),
            s = B(s, Z, p, o, O, 7, E[8]),
            o = B(o, s, Z, p, X, 12, E[9]),
            p = B(p, o, s, Z, V, 17, E[10]),
            Z = B(Z, p, o, s, T, 22, E[11]),
            s = B(s, Z, p, o, P, 7, E[12]),
            o = B(o, s, Z, p, S, 12, E[13]),
            p = B(p, o, s, Z, Q, 17, E[14]),
            Z = B(Z, p, o, s, M, 22, E[15]),
            s = D(s, Z, p, o, y, 5, E[16]),
            o = D(o, s, Z, p, R, 9, E[17]),
            p = D(p, o, s, Z, T, 14, E[18]),
            Z = D(Z, p, o, s, AA, 20, E[19]),
            s = D(s, Z, p, o, U, 5, E[20]),
            o = D(o, s, Z, p, V, 9, E[21]),
            p = D(p, o, s, Z, M, 14, E[22]),
            Z = D(Z, p, o, s, L, 20, E[23]),
            s = D(s, Z, p, o, X, 5, E[24]),
            o = D(o, s, Z, p, Q, 9, E[25]),
            p = D(p, o, s, Z, b, 14, E[26]),
            Z = D(Z, p, o, s, O, 20, E[27]),
            s = D(s, Z, p, o, S, 5, E[28]),
            o = D(o, s, Z, p, l, 9, E[29]),
            p = D(p, o, s, Z, N, 14, E[30]),
            Z = D(Z, p, o, s, P, 20, E[31]),
            s = C(s, Z, p, o, U, 4, E[32]),
            o = C(o, s, Z, p, O, 11, E[33]),
            p = C(p, o, s, Z, T, 16, E[34]),
            Z = C(Z, p, o, s, Q, 23, E[35]),
            s = C(s, Z, p, o, y, 4, E[36]),
            o = C(o, s, Z, p, L, 11, E[37]),
            p = C(p, o, s, Z, N, 16, E[38]),
            Z = C(Z, p, o, s, V, 23, E[39]),
            s = C(s, Z, p, o, S, 4, E[40]),
            o = C(o, s, Z, p, AA, 11, E[41]),
            p = C(p, o, s, Z, b, 16, E[42]),
            Z = C(Z, p, o, s, R, 23, E[43]),
            s = C(s, Z, p, o, X, 4, E[44]),
            o = C(o, s, Z, p, P, 11, E[45]),
            p = C(p, o, s, Z, M, 16, E[46]),
            Z = C(Z, p, o, s, l, 23, E[47]),
            s = K(s, Z, p, o, AA, 6, E[48]),
            o = K(o, s, Z, p, N, 10, E[49]),
            p = K(p, o, s, Z, Q, 15, E[50]),
            Z = K(Z, p, o, s, U, 21, E[51]),
            s = K(s, Z, p, o, P, 6, E[52]),
            o = K(o, s, Z, p, b, 10, E[53]),
            p = K(p, o, s, Z, V, 15, E[54]),
            Z = K(Z, p, o, s, y, 21, E[55]),
            s = K(s, Z, p, o, O, 6, E[56]),
            o = K(o, s, Z, p, M, 10, E[57]),
            p = K(p, o, s, Z, R, 15, E[58]),
            Z = K(Z, p, o, s, S, 21, E[59]),
            s = K(s, Z, p, o, L, 6, E[60]),
            o = K(o, s, Z, p, T, 10, E[61]),
            p = K(p, o, s, Z, l, 15, E[62]),
            Z = K(Z, p, o, s, X, 21, E[63]);
            AB[0] = AB[0] + s | 0;
            AB[1] = AB[1] + Z | 0;
            AB[2] = AB[2] + p | 0;
            AB[3] = AB[3] + o | 0
        },
        _doFinalize: function() {
            var L = this._data,
            P = L.words,
            M = 8 * this._nDataBytes,
            O = 8 * L.sigBytes;
            P[O >>> 5] |= 128 << 24 - O % 32;
            var N = I.floor(M / 4294967296);
            P[(O + 64 >>> 9 << 4) + 15] = (N << 8 | N >>> 24) & 16711935 | (N << 24 | N >>> 8) & 4278255360;
            P[(O + 64 >>> 9 << 4) + 14] = (M << 8 | M >>> 24) & 16711935 | (M << 24 | M >>> 8) & 4278255360;
            L.sigBytes = 4 * (P.length + 1);
            this._process();
            L = this._hash;
            P = L.words;
            for (M = 0; 4 > M; M++) {
                O = P[M],
                P[M] = (O << 8 | O >>> 24) & 16711935 | (O << 24 | O >>> 8) & 4278255360
            }
            return L
        },
        clone: function() {
            var L = H.clone.call(this);
            L._hash = this._hash.clone();
            return L
        }
    });
    J.MD5 = H._createHelper(A);
    J.HmacMD5 = H._createHmacHelper(A)
})(Math); (function() {
    var B = CryptoJS,
    D = B.lib,
    E = D.Base,
    A = D.WordArray,
    D = B.algo,
    C = D.EvpKDF = E.extend({
        cfg: E.extend({
            keySize: 4,
            hasher: D.MD5,
            iterations: 1
        }),
        init: function(F) {
            this.cfg = this.cfg.extend(F)
        },
        compute: function(J, F) {
            for (var H = this.cfg,
            N = H.hasher.create(), K = A.create(), M = K.words, G = H.keySize, H = H.iterations; M.length < G;) {
                I && N.update(I);
                var I = N.update(J).finalize(F);
                N.reset();
                for (var L = 1; L < H; L++) {
                    I = N.finalize(I),
                    N.reset()
                }
                K.concat(I)
            }
            K.sigBytes = 4 * G;
            return K
        }
    });
    B.EvpKDF = function(H, F, G) {
        return C.create(G).compute(H, F)
    }
})();
CryptoJS.lib.Cipher ||
function(M) {
    var C = CryptoJS,
    F = C.lib,
    E = F.Base,
    O = F.WordArray,
    N = F.BufferedBlockAlgorithm,
    A = C.enc.Base64,
    K = C.algo.EvpKDF,
    L = F.Cipher = N.extend({
        cfg: E.extend(),
        createEncryptor: function(Q, P) {
            return this.create(this._ENC_XFORM_MODE, Q, P)
        },
        createDecryptor: function(Q, P) {
            return this.create(this._DEC_XFORM_MODE, Q, P)
        },
        init: function(R, Q, P) {
            this.cfg = this.cfg.extend(P);
            this._xformMode = R;
            this._key = Q;
            this.reset()
        },
        reset: function() {
            N.reset.call(this);
            this._doReset()
        },
        process: function(P) {
            this._append(P);
            return this._process()
        },
        finalize: function(P) {
            P && this._append(P);
            return this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(P) {
            return {
                encrypt: function(Q, R, S) {
                    return ("string" == typeof R ? G: I).encrypt(P, Q, R, S)
                },
                decrypt: function(Q, R, S) {
                    return ("string" == typeof R ? G: I).decrypt(P, Q, R, S)
                }
            }
        }
    });
    F.StreamCipher = L.extend({
        _doFinalize: function() {
            return this._process(!0)
        },
        blockSize: 1
    });
    var H = C.mode = {},
    J = function(R, Q, P) {
        var T = this._iv;
        T ? this._iv = M: T = this._prevBlock;
        for (var S = 0; S < P; S++) {
            R[Q + S] ^= T[S]
        }
    },
    B = (F.BlockCipherMode = E.extend({
        createEncryptor: function(Q, P) {
            return this.Encryptor.create(Q, P)
        },
        createDecryptor: function(Q, P) {
            return this.Decryptor.create(Q, P)
        },
        init: function(Q, P) {
            this._cipher = Q;
            this._iv = P
        }
    })).extend();
    B.Encryptor = B.extend({
        processBlock: function(R, Q) {
            var P = this._cipher,
            S = P.blockSize;
            J.call(this, R, Q, S);
            P.encryptBlock(R, Q);
            this._prevBlock = R.slice(Q, Q + S)
        }
    });
    B.Decryptor = B.extend({
        processBlock: function(R, Q) {
            var P = this._cipher,
            T = P.blockSize,
            S = R.slice(Q, Q + T);
            P.decryptBlock(R, Q);
            J.call(this, R, Q, T);
            this._prevBlock = S
        }
    });
    H = H.CBC = B;
    B = (C.pad = {}).Pkcs7 = {
        pad: function(R, P) {
            for (var U = 4 * P,
            U = U - R.sigBytes % U,
            S = U << 24 | U << 16 | U << 8 | U,
            Q = [], T = 0; T < U; T += 4) {
                Q.push(S)
            }
            U = O.create(Q, U);
            R.concat(U)
        },
        unpad: function(P) {
            P.sigBytes -= P.words[P.sigBytes - 1 >>> 2] & 255
        }
    };
    F.BlockCipher = L.extend({
        cfg: L.cfg.extend({
            mode: H,
            padding: B
        }),
        reset: function() {
            L.reset.call(this);
            var Q = this.cfg,
            P = Q.iv,
            Q = Q.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                var R = Q.createEncryptor
            } else {
                R = Q.createDecryptor,
                this._minBufferSize = 1
            }
            this._mode = R.call(Q, this, P && P.words)
        },
        _doProcessBlock: function(Q, P) {
            this._mode.processBlock(Q, P)
        },
        _doFinalize: function() {
            var Q = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                Q.pad(this._data, this.blockSize);
                var P = this._process(!0)
            } else {
                P = this._process(!0),
                Q.unpad(P)
            }
            return P
        },
        blockSize: 4
    });
    var D = F.CipherParams = E.extend({
        init: function(P) {
            this.mixIn(P)
        },
        toString: function(P) {
            return (P || this.formatter).stringify(this)
        }
    }),
    H = (C.format = {}).OpenSSL = {
        stringify: function(Q) {
            var P = Q.ciphertext;
            Q = Q.salt;
            return (Q ? O.create([1398893684, 1701076831]).concat(Q).concat(P) : P).toString(A)
        },
        parse: function(Q) {
            Q = A.parse(Q);
            var P = Q.words;
            if (1398893684 == P[0] && 1701076831 == P[1]) {
                var R = O.create(P.slice(2, 4));
                P.splice(0, 4);
                Q.sigBytes -= 16
            }
            return D.create({
                ciphertext: Q,
                salt: R
            })
        }
    },
    I = F.SerializableCipher = E.extend({
        cfg: E.extend({
            format: H
        }),
        encrypt: function(R, P, T, S) {
            S = this.cfg.extend(S);
            var Q = R.createEncryptor(T, S);
            P = Q.finalize(P);
            Q = Q.cfg;
            return D.create({
                ciphertext: P,
                key: T,
                iv: Q.iv,
                algorithm: R,
                mode: Q.mode,
                padding: Q.padding,
                blockSize: R.blockSize,
                formatter: S.format
            })
        },
        decrypt: function(Q, P, S, R) {
            R = this.cfg.extend(R);
            P = this._parse(P, R.format);
            return Q.createDecryptor(S, R).finalize(P.ciphertext)
        },
        _parse: function(Q, P) {
            return "string" == typeof Q ? P.parse(Q, this) : Q
        }
    }),
    C = (C.kdf = {}).OpenSSL = {
        execute: function(Q, P, S, R) {
            R || (R = O.random(8));
            Q = K.create({
                keySize: P + S
            }).compute(Q, R);
            S = O.create(Q.words.slice(P), 4 * S);
            Q.sigBytes = 4 * P;
            return D.create({
                key: Q,
                iv: S,
                salt: R
            })
        }
    },
    G = F.PasswordBasedCipher = I.extend({
        cfg: I.cfg.extend({
            kdf: C
        }),
        encrypt: function(P, S, R, Q) {
            Q = this.cfg.extend(Q);
            R = Q.kdf.execute(R, P.keySize, P.ivSize);
            Q.iv = R.iv;
            P = I.encrypt.call(this, P, S, R.key, Q);
            P.mixIn(R);
            return P
        },
        decrypt: function(P, S, R, Q) {
            Q = this.cfg.extend(Q);
            S = this._parse(S, Q.format);
            R = Q.kdf.execute(R, P.keySize, P.ivSize, S.salt);
            Q.iv = R.iv;
            return I.decrypt.call(this, P, S, R.key, Q)
        }
    })
} (); (function() {
    for (var L = CryptoJS,
    Q = L.lib.BlockCipher,
    W = L.algo,
    S = [], N = [], M = [], O = [], E = [], J = [], Y = [], C = [], P = [], R = [], Z = [], X = 0; 256 > X; X++) {
        Z[X] = 128 > X ? X << 1 : X << 1 ^ 283
    }
    for (var V = 0,
    U = 0,
    X = 0; 256 > X; X++) {
        var T = U ^ U << 1 ^ U << 2 ^ U << 3 ^ U << 4,
        T = T >>> 8 ^ T & 255 ^ 99;
        S[V] = T;
        N[T] = V;
        var A = Z[V],
        K = Z[A],
        I = Z[K],
        B = 257 * Z[T] ^ 16843008 * T;
        M[V] = B << 24 | B >>> 8;
        O[V] = B << 16 | B >>> 16;
        E[V] = B << 8 | B >>> 24;
        J[V] = B;
        B = 16843009 * I ^ 65537 * K ^ 257 * A ^ 16843008 * V;
        Y[T] = B << 24 | B >>> 8;
        C[T] = B << 16 | B >>> 16;
        P[T] = B << 8 | B >>> 24;
        R[T] = B;
        V ? (V = A ^ Z[Z[Z[I ^ A]]], U ^= Z[Z[U]]) : V = U = 1
    }
    var D = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
    W = W.AES = Q.extend({
        _doReset: function() {
            for (var F = this._key,
            g = F.words,
            f = F.sigBytes / 4,
            F = 4 * ((this._nRounds = f + 6) + 1), b = this._keySchedule = [], H = 0; H < F; H++) {
                if (H < f) {
                    b[H] = g[H]
                } else {
                    var G = b[H - 1];
                    H % f ? 6 < f && 4 == H % f && (G = S[G >>> 24] << 24 | S[G >>> 16 & 255] << 16 | S[G >>> 8 & 255] << 8 | S[G & 255]) : (G = G << 8 | G >>> 24, G = S[G >>> 24] << 24 | S[G >>> 16 & 255] << 16 | S[G >>> 8 & 255] << 8 | S[G & 255], G ^= D[H / f | 0] << 24);
                    b[H] = b[H - f] ^ G
                }
            }
            g = this._invKeySchedule = [];
            for (f = 0; f < F; f++) {
                H = F - f,
                G = f % 4 ? b[H] : b[H - 4],
                g[f] = 4 > f || 4 >= H ? G: Y[S[G >>> 24]] ^ C[S[G >>> 16 & 255]] ^ P[S[G >>> 8 & 255]] ^ R[S[G & 255]]
            }
        },
        encryptBlock: function(G, F) {
            this._doCryptBlock(G, F, this._keySchedule, M, O, E, J, S)
        },
        decryptBlock: function(F, H) {
            var G = F[H + 1];
            F[H + 1] = F[H + 3];
            F[H + 3] = G;
            this._doCryptBlock(F, H, this._invKeySchedule, Y, C, P, R, N);
            G = F[H + 1];
            F[H + 1] = F[H + 3];
            F[H + 3] = G
        },
        _doCryptBlock: function(AH, AG, AF, AE, AD, z, x, AC) {
            for (var w = this._nRounds,
            AB = AH[AG] ^ AF[0], AA = AH[AG + 1] ^ AF[1], y = AH[AG + 2] ^ AF[2], v = AH[AG + 3] ^ AF[3], u = 4, H = 1; H < w; H++) {
                var o = AE[AB >>> 24] ^ AD[AA >>> 16 & 255] ^ z[y >>> 8 & 255] ^ x[v & 255] ^ AF[u++],
                G = AE[AA >>> 24] ^ AD[y >>> 16 & 255] ^ z[v >>> 8 & 255] ^ x[AB & 255] ^ AF[u++],
                F = AE[y >>> 24] ^ AD[v >>> 16 & 255] ^ z[AB >>> 8 & 255] ^ x[AA & 255] ^ AF[u++],
                v = AE[v >>> 24] ^ AD[AB >>> 16 & 255] ^ z[AA >>> 8 & 255] ^ x[y & 255] ^ AF[u++],
                AB = o,
                AA = G,
                y = F
            }
            o = (AC[AB >>> 24] << 24 | AC[AA >>> 16 & 255] << 16 | AC[y >>> 8 & 255] << 8 | AC[v & 255]) ^ AF[u++];
            G = (AC[AA >>> 24] << 24 | AC[y >>> 16 & 255] << 16 | AC[v >>> 8 & 255] << 8 | AC[AB & 255]) ^ AF[u++];
            F = (AC[y >>> 24] << 24 | AC[v >>> 16 & 255] << 16 | AC[AB >>> 8 & 255] << 8 | AC[AA & 255]) ^ AF[u++];
            v = (AC[v >>> 24] << 24 | AC[AB >>> 16 & 255] << 16 | AC[AA >>> 8 & 255] << 8 | AC[y & 255]) ^ AF[u++];
            AH[AG] = o;
            AH[AG + 1] = G;
            AH[AG + 2] = F;
            AH[AG + 3] = v
        },
        keySize: 8
    });
    L.AES = Q._createHelper(W)
})(); (function(R) {
    var J = R.Base64;
    var E = "2.1.9";
    var S;
    if (typeof module !== "undefined" && module.exports) {
        try {
            S = require("buffer").Buffer
        } catch(G) {}
    }
    var P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var C = function(c) {
        var b = {};
        for (var a = 0,
        Z = c.length; a < Z; a++) {
            b[c.charAt(a)] = a
        }
        return b
    } (P);
    var V = String.fromCharCode;
    var X = function(a) {
        if (a.length < 2) {
            var Z = a.charCodeAt(0);
            return Z < 128 ? a: Z < 2048 ? (V(192 | (Z >>> 6)) + V(128 | (Z & 63))) : (V(224 | ((Z >>> 12) & 15)) + V(128 | ((Z >>> 6) & 63)) + V(128 | (Z & 63)))
        } else {
            var Z = 65536 + (a.charCodeAt(0) - 55296) * 1024 + (a.charCodeAt(1) - 56320);
            return (V(240 | ((Z >>> 18) & 7)) + V(128 | ((Z >>> 12) & 63)) + V(128 | ((Z >>> 6) & 63)) + V(128 | (Z & 63)))
        }
    };
    var K = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var H = function(Z) {
        return Z.replace(K, X)
    };
    var Q = function(c) {
        var b = [0, 2, 1][c.length % 3],
        Z = c.charCodeAt(0) << 16 | ((c.length > 1 ? c.charCodeAt(1) : 0) << 8) | ((c.length > 2 ? c.charCodeAt(2) : 0)),
        a = [P.charAt(Z >>> 18), P.charAt((Z >>> 12) & 63), b >= 2 ? "=": P.charAt((Z >>> 6) & 63), b >= 1 ? "=": P.charAt(Z & 63)];
        return a.join("")
    };
    var L = R.btoa ?
    function(Z) {
        return R.btoa(Z)
    }: function(Z) {
        return Z.replace(/[\s\S]{1,3}/g, Q)
    };
    var O = S ?
    function(Z) {
        return (Z.constructor === S.constructor ? Z: new S(Z)).toString("base64")
    }: function(Z) {
        return L(H(Z))
    };
    var F = function(Z, a) {
        return ! a ? O(String(Z)) : O(String(Z)).replace(/[+\/]/g,
        function(b) {
            return b == "+" ? "-": "_"
        }).replace(/=/g, "")
    };
    var U = function(Z) {
        return F(Z, true)
    };
    var D = new RegExp(["[\xC0-\xDF][\x80-\xBF]", "[\xE0-\xEF][\x80-\xBF]{2}", "[\xF0-\xF7][\x80-\xBF]{3}"].join("|"), "g");
    var T = function(b) {
        switch (b.length) {
        case 4:
            var Z = ((7 & b.charCodeAt(0)) << 18) | ((63 & b.charCodeAt(1)) << 12) | ((63 & b.charCodeAt(2)) << 6) | (63 & b.charCodeAt(3)),
            a = Z - 65536;
            return (V((a >>> 10) + 55296) + V((a & 1023) + 56320));
        case 3:
            return V(((15 & b.charCodeAt(0)) << 12) | ((63 & b.charCodeAt(1)) << 6) | (63 & b.charCodeAt(2)));
        default:
            return V(((31 & b.charCodeAt(0)) << 6) | (63 & b.charCodeAt(1)))
        }
    };
    var B = function(Z) {
        return Z.replace(D, T)
    };
    var A = function(e) {
        var Z = e.length,
        b = Z % 4,
        c = (Z > 0 ? C[e.charAt(0)] << 18 : 0) | (Z > 1 ? C[e.charAt(1)] << 12 : 0) | (Z > 2 ? C[e.charAt(2)] << 6 : 0) | (Z > 3 ? C[e.charAt(3)] : 0),
        a = [V(c >>> 16), V((c >>> 8) & 255), V(c & 255)];
        a.length -= [0, 0, 2, 1][b];
        return a.join("")
    };
    var I = R.atob ?
    function(Z) {
        return R.atob(Z)
    }: function(Z) {
        return Z.replace(/[\s\S]{1,4}/g, A)
    };
    var W = S ?
    function(Z) {
        return (Z.constructor === S.constructor ? Z: new S(Z, "base64")).toString()
    }: function(Z) {
        return B(I(Z))
    };
    var M = function(Z) {
        return W(String(Z).replace(/[-_]/g,
        function(a) {
            return a == "-" ? "+": "/"
        }).replace(/[^A-Za-z0-9\+\/]/g, ""))
    };
    var Y = function() {
        var Z = R.Base64;
        R.Base64 = J;
        return Z
    };
    R.Base64 = {
        VERSION: E,
        atob: I,
        btoa: L,
        fromBase64: M,
        toBase64: F,
        utob: H,
        encode: F,
        encodeURI: U,
        btou: B,
        decode: M,
        noConflict: Y
    };
    if (typeof Object.defineProperty === "function") {
        var N = function(Z) {
            return {
                value: Z,
                enumerable: false,
                writable: true,
                configurable: true
            }
        };
        R.Base64.extendString = function() {
            Object.defineProperty(String.prototype, "fromBase64", N(function() {
                return M(this)
            }));
            Object.defineProperty(String.prototype, "toBase64", N(function(Z) {
                return F(this, Z)
            }));
            Object.defineProperty(String.prototype, "toBase64URI", N(function() {
                return F(this, true)
            }))
        }
    }
    if (R.Meteor) {
        Base64 = R.Base64
    }
})(this);
var Fingerprint = function(A) {
    var B, C;
    B = Array.prototype.forEach;
    C = Array.prototype.map;
    this.each = function(I, H, G) {
        if (I === null) {
            return
        }
        if (B && I.forEach === B) {
            I.forEach(H, G)
        } else {
            if (I.length === +I.length) {
                for (var F = 0,
                D = I.length; F < D; F++) {
                    if (H.call(G, I[F], F, I) === {}) {
                        return
                    }
                }
            } else {
                for (var E in I) {
                    if (I.hasOwnProperty(E)) {
                        if (H.call(G, I[E], E, I) === {}) {
                            return
                        }
                    }
                }
            }
        }
    };
    this.map = function(G, F, E) {
        var D = [];
        if (G == null) {
            return D
        }
        if (C && G.map === C) {
            return G.map(F, E)
        }
        this.each(G,
        function(J, H, I) {
            D[D.length] = F.call(E, J, H, I)
        });
        return D
    };
    if (typeof A == "object") {
        this.hasher = A.hasher;
        this.screen_resolution = A.screen_resolution;
        this.screen_orientation = A.screen_orientation;
        this.canvas = A.canvas;
        this.ie_activex = A.ie_activex
    } else {
        if (typeof A == "function") {
            this.hasher = A
        }
    }
};
Fingerprint.prototype = {
    get: function() {
        var B = [];
        B.push(navigator.userAgent);
        B.push(navigator.language);
        // B.push(screen.colorDepth);
        B.push(24);
        if (this.screen_resolution) {
            var A = this.getScreenResolution();
            if (typeof A !== "undefined") {
                B.push(A.join("x"))
            }
        }
        B.push(new Date().getTimezoneOffset());
        B.push(this.hasSessionStorage());
        B.push(this.hasLocalStorage());
        B.push( !! window.indexedDB);
        if (document.body) {
             B.push(typeof(document.body.addBehavior))
         } else {
            B.push(typeof undefined)
         }
        B.push(typeof(window.openDatabase));
        B.push(navigator.cpuClass);
        B.push(navigator.platform);
        B.push(navigator.doNotTrack);
        B.push(this.getPluginsString());
        if (this.canvas && this.isCanvasSupported()) {
            B.push(this.getCanvasFingerprint())
        }
        B.push(this.getRandom());
        if (this.hasher) {
            return this.hasher(B.join("###"), 31)
        } else {
            return this.murmurhash3_32_gc(B.join("###"), 31)
        }
    },
    murmurhash3_32_gc: function(H, E) {
        var I, J, G, A, D, B, F, C;
        I = H.length & 3;
        J = H.length - I;
        G = E;
        D = 3432918353;
        B = 461845907;
        C = 0;
        while (C < J) {
            F = ((H.charCodeAt(C) & 255)) | ((H.charCodeAt(++C) & 255) << 8) | ((H.charCodeAt(++C) & 255) << 16) | ((H.charCodeAt(++C) & 255) << 24); ++C;
            F = ((((F & 65535) * D) + ((((F >>> 16) * D) & 65535) << 16))) & 4294967295;
            F = (F << 15) | (F >>> 17);
            F = ((((F & 65535) * B) + ((((F >>> 16) * B) & 65535) << 16))) & 4294967295;
            G ^= F;
            G = (G << 13) | (G >>> 19);
            A = ((((G & 65535) * 5) + ((((G >>> 16) * 5) & 65535) << 16))) & 4294967295;
            G = (((A & 65535) + 27492) + ((((A >>> 16) + 58964) & 65535) << 16))
        }
        F = 0;
        switch (I) {
        case 3:
            F ^= (H.charCodeAt(C + 2) & 255) << 16;
        case 2:
            F ^= (H.charCodeAt(C + 1) & 255) << 8;
        case 1:
            F ^= (H.charCodeAt(C) & 255);
            F = (((F & 65535) * D) + ((((F >>> 16) * D) & 65535) << 16)) & 4294967295;
            F = (F << 15) | (F >>> 17);
            F = (((F & 65535) * B) + ((((F >>> 16) * B) & 65535) << 16)) & 4294967295;
            G ^= F
        }
        G ^= H.length;
        G ^= G >>> 16;
        G = (((G & 65535) * 2246822507) + ((((G >>> 16) * 2246822507) & 65535) << 16)) & 4294967295;
        G ^= G >>> 13;
        G = ((((G & 65535) * 3266489909) + ((((G >>> 16) * 3266489909) & 65535) << 16))) & 4294967295;
        G ^= G >>> 16;
        return G >>> 0
    },
    hasLocalStorage: function() {
        try {
            return !! window.localStorage
        } catch(A) {
            return true
        }
    },
    hasSessionStorage: function() {
        try {
            return !! window.sessionStorage
        } catch(A) {
            return true
        }
    },
    isCanvasSupported: function() {
        var A = document.createElement("canvas");
        return !! (A.getContext && A.getContext("2d"))
    },
    isIE: function() {
        if (navigator.appName === "Microsoft Internet Explorer") {
            return true
        } else {
            if (navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) {
                return true
            }
        }
        return false
    },
    getPluginsString: function() {
        if (this.isIE() && this.ie_activex) {
            return this.getIEPluginsString()
        } else {
            return this.getRegularPluginsString()
        }
    },
    getRegularPluginsString: function() {
        return this.map(navigator.plugins,
        function(B) {
            var A = this.map(B,
            function(C) {
                return [C.type, C.suffixes].join("~")
            }).join(",");
            return [B.name, B.description, A].join("::")
        },
        this).join(";")
    },
    getIEPluginsString: function() {
        if (window.ActiveXObject) {
            var A = ["ShockwaveFlash.ShockwaveFlash", "AcroPDF.PDF", "PDF.PdfCtrl", "QuickTime.QuickTime", "rmocx.RealPlayer G2 Control", "rmocx.RealPlayer G2 Control.1", "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "RealPlayer", "SWCtl.SWCtl", "WMPlayer.OCX", "AgControl.AgControl", "Skype.Detection"];
            return this.map(A,
            function(B) {
                try {
                    new ActiveXObject(B);
                    return B
                } catch(C) {
                    return null
                }
            }).join(";")
        } else {
            return ""
        }
    },
    getScreenResolution: function() {
        var A;
        if (this.screen_orientation) {
            A = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height]
        } else {
            A = [screen.height, screen.width]
        }
        return A
    },
    getCanvasFingerprint: function() {
        var C = document.createElement("canvas");
        var B = C.getContext("2d");
        var A = "aq";
        B.textBaseline = "top";
        B.font = "14px 'Arial'";
        B.textBaseline = "alphabetic";
        B.fillStyle = "#f60";
        B.fillRect(125, 1, 62, 20);
        B.fillStyle = "#069";
        B.fillText(A, 2, 15);
        B.fillStyle = "rgba(102, 204, 0, 0.7)";
        B.fillText(A, 4, 17);
        return C.toDataURL()
    },
    getRandom: function() {
        var A = +new Date();
        return A
    }
};
// var CookieUtil = {
//     set: function(B, E, A, D, G, F) {
//         var C = encodeURIComponent(B) + "=" + encodeURIComponent(E);
//         if (A && A instanceof Date) {
//             C += "; expires=" + A.toGMTString()
//         }
//         if (G) {
//             C += "; path=" + G
//         }
//         if (D) {
//             C += "; domain=" + G
//         }
//         if (F) {
//             C += "; secure"
//         }
//         document.cookie = C
//     },
//     get: function(A) {
//         var E = encodeURIComponent(A),
//         D = document.cookie.indexOf(E),
//         C = null;
//         if (D > -1) {
//             var B = document.cookie.indexOf(";", D);
//             if (B == -1) {
//                 B = document.cookie.length
//             }
//             C = document.cookie.substring(D + E.length + 1, B)
//         }
//         return C
//     },
//     unset: function(A, D, B, C) {
//         this.set(A, "", new Date(0), B, D, C)
//     }
// };
// var guid;
// if (!CookieUtil.get("TDC_token")) {
//     guid = new Fingerprint().get();
//     var d = new Date();
//     d.setTime(d.getTime() + (3600 * 24 * 60 * 60 * 1000));
//     CookieUtil.set("TDC_token", guid, d)
// } else {
//     guid = parseInt(CookieUtil.get("TDC_token"), 10)
// }
var g_collectJsonData = {};
var guid = new Fingerprint().get();
g_collectJsonData.keyboards = [];
g_collectJsonData.mousemove = [];
g_collectJsonData.mouseclick = [];
g_collectJsonData.time = [];
var g_startTime = Math.floor((Date.parse(new Date()) / 1000));
var g_curTime = -1;
var g_capAttempCnt = 0;
var g_mouseClickCnt = 0;
var g_mouseMoveCnt = 0;
var g_keyDownCnt = 0;
function getLeft(C) {
    if (C == null) {
        return null
    }
    var B = C;
    var A = B.offsetLeft;
    while (B != null && B.offsetParent != null && B.offsetParent.tagName != "BODY") {
        A = A + B.offsetParent.offsetLeft;
        B = B.offsetParent
    }
    return A
}
function getTop(C) {
    if (C == null) {
        return null
    }
    var B = C;
    var A = B.offsetTop;
    while (B != null && B.offsetParent != null && B.offsetParent.tagName != "BODY") {
        A = A + B.offsetParent.offsetTop;
        B = B.offsetParent
    }
    return A
}
EventListenerEx = {
    add: function(C, B, A) {
        if (document.addEventListener) {
            C.addEventListener(B, A, false)
        } else {
            if (document.attachEvent) {
                C.attachEvent("on" + B, A)
            } else {
                C["on" + B] = A
            }
        }
    },
    remove: function(C, B, A) {
        if (document.removeEventListener) {
            C.removeEventListener(B, A, false)
        } else {
            if (document.detachEvent) {
                C.detachEvent("on" + B, A)
            } else {
                C["on" + B] = null
            }
        }
    }
};
function mouseClick(C) {
    if (g_mouseClickCnt < 10) {
        var B, A;
        if (C.pageX != undefined) {
            B = C.pageX;
            A = C.pageY
        } else {
            B = C.clientX + document.body.scrollLeft - document.body.clientLeft,
            A = C.clientY + document.body.scrollTop - document.body.clientTop
        }
        g_collectJsonData.mouseclick.push({
            t: Math.floor((Date.parse(new Date()) / 1000)) - g_startTime,
            x: Math.floor(B),
            y: Math.floor(A)
        });
        g_mouseClickCnt++
    }
}
function mouseMove(C) {
    if (g_mouseMoveCnt < 10 && g_curTime != Math.floor((Date.parse(new Date()) / 1000))) {
        g_curTime = Math.floor((Date.parse(new Date()) / 1000));
        var B, A;
        if (C.pageX != undefined) {
            B = C.pageX;
            A = C.pageY
        } else {
            B = C.clientX + document.body.scrollLeft - document.body.clientLeft,
            A = C.clientY + document.body.scrollTop - document.body.clientTop
        }
        g_collectJsonData.mousemove.push({
            t: Math.floor((Date.parse(new Date()) / 1000)) - g_startTime,
            x: Math.floor(B),
            y: Math.floor(A)
        });
        g_mouseMoveCnt++
    }
}
EventListenerEx.add(document, "click", mouseClick);
EventListenerEx.add(document, "mousemove", mouseMove);
document.onkeydown = function(A) {
    var B = A || window.event || arguments.callee.caller.arguments[0];
    if (g_keyDownCnt < 30) {
        Array.prototype.push.apply(g_collectJsonData.keyboards, [B.keyCode]);
        g_keyDownCnt++
    }
};
function getBrower() {
    var D = navigator.userAgent.toLowerCase();
    var E = /msie [\d.]+;/gi;
    var B = /firefox\/[\d.]+/gi;
    var A = /chrome\/[\d.]+/gi;
    var C = /safari\/[\d.]+/gi;
    if (D.indexOf("msie") > 0) {
        return D.match(E).join("")
    }
    if (D.indexOf("firefox") > 0) {
        return D.match(B).join("")
    }
    if (D.indexOf("chrome") > 0) {
        return D.match(A).join("")
    }
    if (D.indexOf("safari") > 0 && D.indexOf("chrome") < 0) {
        return D.match(C).join("")
    }
    return "other"
}
function getOs() {
    var B = navigator.userAgent;
    var G = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var H = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (H) {
        return "Mac"
    }
    var E = (navigator.platform == "X11") && !G && !H;
    if (E) {
        return "Unix"
    }
    var D = (String(navigator.platform).indexOf("Linux") > -1);
    var A = B.toLowerCase().match(/android/i) == "android";
    if (D) {
        if (A) {
            return "Android"
        } else {
            return "Linux"
        }
    }
    if (B.toLowerCase().indexOf("like mac os x") > -1) {
        return "IOS"
    }
    if (G) {
        var F = B.indexOf("Windows NT 5.0") > -1 || B.indexOf("Windows 2000") > -1;
        if (F) {
            return "Win2000"
        }
        var K = B.indexOf("Windows NT 5.1") > -1 || B.indexOf("Windows XP") > -1;
        if (K) {
            return "WinXP"
        }
        var C = B.indexOf("Windows NT 5.2") > -1 || B.indexOf("Windows 2003") > -1;
        if (C) {
            return "Win2003"
        }
        var I = B.indexOf("Windows NT 6.0") > -1 || B.indexOf("Windows Vista") > -1;
        if (I) {
            return "WinVista"
        }
        var J = B.indexOf("Windows NT 6.1") > -1 || B.indexOf("Windows 7") > -1;
        if (J) {
            return "Win7"
        }
    }
    return "other"
}
function getTrace() {
    if (arguments.length > 0) {
        g_collectJsonData.refreshCnt = parseInt(arguments[0])
    } else {
        g_collectJsonData.refreshCnt = 0
    }
    g_capAttempCnt++;
    g_collectJsonData.tryCnt = g_capAttempCnt;
    if (navigator.userAgent != "undefined") {
        g_collectJsonData.userAgent = getBrower() == "other" ? navigator.userAgent: getBrower()
    }
    if (typeof(navigator.plugins) != "undefined") {
        g_collectJsonData.pluginNum = navigator.plugins.length
    }
    g_collectJsonData.os = getOs();
    g_collectJsonData.resolution = [];
    Array.prototype.push.apply(g_collectJsonData.resolution, [screen.width, screen.height]);
    g_collectJsonData.time = [];
    Array.prototype.push.apply(g_collectJsonData.time, [g_startTime, Math.floor((Date.parse(new Date()) / 1000))]);
    g_collectJsonData.url = document.location.href;
    g_collectJsonData.guid = guid;
    var D = "0123456789abcdef";
    var C = "0123456789abcdef";
    D = CryptoJS.enc.Utf8.parse(D);
    C = CryptoJS.enc.Utf8.parse(C);
    var E = JSON.stringify(g_collectJsonData);
    E = E.length > 1024 ? E.substring(0, 1024) : E;
    var B = 15 - E.length % 16;
    for (i = 0; i < B; i++) {
        E += " "
    }
    var F = CryptoJS.AES.encrypt(E, D, {
        iv: C,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    g_collectJsonData = {};
    g_collectJsonData.keyboards = [];
    g_collectJsonData.mousemove = [];
    g_collectJsonData.mouseclick = [];
    g_collectJsonData.time = [];
    g_mouseClickCnt = 0;
    g_mouseMoveCnt = 0;
    g_keyDownCnt = 0;
    var A = F.toString();
    A = A.replace(/\+/g, "-");
    A = A.replace(/\//g, "_");
    A = A.replace(/=/g, "*");
    return A.length > 1500 ? A.substring(0, 1500) : A
};
function load(){
            document.getElementById('hello').innerHTML = getTrace();
          }

var CryptoJS = CryptoJS ||
function(K, C) {
    var F = {},
    E = F.lib = {},
    M = function() {},
    L = E.Base = {
        extend: function(N) {
            M.prototype = this;
            var O = new M;
            N && O.mixIn(N);
            O.hasOwnProperty("init") || (O.init = function() {
                O.$super.init.apply(this, arguments)
            });
            O.init.prototype = O;
            O.$super = this;
            return O
        },
        create: function() {
            var N = this.extend();
            N.init.apply(N, arguments);
            return N
        },
        init: function() {},
        mixIn: function(N) {
            for (var O in N) {
                N.hasOwnProperty(O) && (this[O] = N[O])
            }
            N.hasOwnProperty("toString") && (this.toString = N.toString)
        },
        clone: function() {
            return this.init.prototype.extend(this)
        }
    },
    A = E.WordArray = L.extend({
        init: function(N, O) {
            N = this.words = N || [];
            this.sigBytes = O != C ? O: 4 * N.length
        },
        toString: function(N) {
            return (N || J).stringify(this)
        },
        concat: function(N) {
            var R = this.words,
            Q = N.words,
            P = this.sigBytes;
            N = N.sigBytes;
            this.clamp();
            if (P % 4) {
                for (var O = 0; O < N; O++) {
                    R[P + O >>> 2] |= (Q[O >>> 2] >>> 24 - 8 * (O % 4) & 255) << 24 - 8 * ((P + O) % 4)
                }
            } else {
                if (65535 < Q.length) {
                    for (O = 0; O < N; O += 4) {
                        R[P + O >>> 2] = Q[O >>> 2]
                    }
                } else {
                    R.push.apply(R, Q)
                }
            }
            this.sigBytes += N;
            return this
        },
        clamp: function() {
            var N = this.words,
            O = this.sigBytes;
            N[O >>> 2] &= 4294967295 << 32 - 8 * (O % 4);
            N.length = K.ceil(O / 4)
        },
        clone: function() {
            var N = L.clone.call(this);
            N.words = this.words.slice(0);
            return N
        },
        random: function(N) {
            for (var P = [], O = 0; O < N; O += 4) {
                P.push(4294967296 * K.random() | 0)
            }
            return new A.init(P, N)
        }
    }),
    I = F.enc = {},
    J = I.Hex = {
        stringify: function(N) {
            var R = N.words;
            N = N.sigBytes;
            for (var Q = [], P = 0; P < N; P++) {
                var O = R[P >>> 2] >>> 24 - 8 * (P % 4) & 255;
                Q.push((O >>> 4).toString(16));
                Q.push((O & 15).toString(16))
            }
            return Q.join("")
        },
        parse: function(N) {
            for (var Q = N.length,
            P = [], O = 0; O < Q; O += 2) {
                P[O >>> 3] |= parseInt(N.substr(O, 2), 16) << 24 - 4 * (O % 8)
            }
            return new A.init(P, Q / 2)
        }
    },
    G = I.Latin1 = {
        stringify: function(N) {
            var Q = N.words;
            N = N.sigBytes;
            for (var P = [], O = 0; O < N; O++) {
                P.push(String.fromCharCode(Q[O >>> 2] >>> 24 - 8 * (O % 4) & 255))
            }
            return P.join("")
        },
        parse: function(N) {
            for (var Q = N.length,
            P = [], O = 0; O < Q; O++) {
                P[O >>> 2] |= (N.charCodeAt(O) & 255) << 24 - 8 * (O % 4)
            }
            return new A.init(P, Q)
        }
    },
    H = I.Utf8 = {
        stringify: function(N) {
            try {
                return decodeURIComponent(escape(G.stringify(N)))
            } catch(O) {
                throw Error("Malformed UTF-8 data")
            }
        },
        parse: function(N) {
            return G.parse(unescape(encodeURIComponent(N)))
        }
    },
    B = E.BufferedBlockAlgorithm = L.extend({
        reset: function() {
            this._data = new A.init;
            this._nDataBytes = 0
        },
        _append: function(N) {
            "string" == typeof N && (N = H.parse(N));
            this._data.concat(N);
            this._nDataBytes += N.sigBytes
        },
        _process: function(O) {
            var T = this._data,
            S = T.words,
            Q = T.sigBytes,
            P = this.blockSize,
            N = Q / (4 * P),
            N = O ? K.ceil(N) : K.max((N | 0) - this._minBufferSize, 0);
            O = N * P;
            Q = K.min(4 * O, Q);
            if (O) {
                for (var R = 0; R < O; R += P) {
                    this._doProcessBlock(S, R)
                }
                R = S.splice(0, O);
                T.sigBytes -= Q
            }
            return new A.init(R, Q)
        },
        clone: function() {
            var N = L.clone.call(this);
            N._data = this._data.clone();
            return N
        },
        _minBufferSize: 0
    });
    E.Hasher = B.extend({
        cfg: L.extend(),
        init: function(N) {
            this.cfg = this.cfg.extend(N);
            this.reset()
        },
        reset: function() {
            B.reset.call(this);
            this._doReset()
        },
        update: function(N) {
            this._append(N);
            this._process();
            return this
        },
        finalize: function(N) {
            N && this._append(N);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(N) {
            return function(O, P) {
                return (new N.init(P)).finalize(O)
            }
        },
        _createHmacHelper: function(N) {
            return function(O, P) {
                return (new D.HMAC.init(N, P)).finalize(O)
            }
        }
    });
    var D = F.algo = {};
    return F
} (Math); (function() {
    var A = CryptoJS,
    B = A.lib.WordArray;
    A.enc.Base64 = {
        stringify: function(I) {
            var D = I.words,
            H = I.sigBytes,
            F = this._map;
            I.clamp();
            I = [];
            for (var G = 0; G < H; G += 3) {
                for (var C = (D[G >>> 2] >>> 24 - 8 * (G % 4) & 255) << 16 | (D[G + 1 >>> 2] >>> 24 - 8 * ((G + 1) % 4) & 255) << 8 | D[G + 2 >>> 2] >>> 24 - 8 * ((G + 2) % 4) & 255, E = 0; 4 > E && G + 0.75 * E < H; E++) {
                    I.push(F.charAt(C >>> 6 * (3 - E) & 63))
                }
            }
            if (D = F.charAt(64)) {
                for (; I.length % 4;) {
                    I.push(D)
                }
            }
            return I.join("")
        },
        parse: function(J) {
            var E = J.length,
            H = this._map,
            G = H.charAt(64);
            G && (G = J.indexOf(G), -1 != G && (E = G));
            for (var G = [], I = 0, D = 0; D < E; D++) {
                if (D % 4) {
                    var F = H.indexOf(J.charAt(D - 1)) << 2 * (D % 4),
                    C = H.indexOf(J.charAt(D)) >>> 6 - 2 * (D % 4);
                    G[I >>> 2] |= (F | C) << 24 - 8 * (I % 4);
                    I++
                }
            }
            return B.create(G, I)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
})(); (function(I) {
    function B(L, R, M, Q, P, O, N) {
        L = L + (R & M | ~R & Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function D(L, R, M, Q, P, O, N) {
        L = L + (R & Q | M & ~Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function C(L, R, M, Q, P, O, N) {
        L = L + (R ^ M ^ Q) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    function K(L, R, M, Q, P, O, N) {
        L = L + (M ^ (R | ~Q)) + P + N;
        return (L << O | L >>> 32 - O) + R
    }
    for (var J = CryptoJS,
    A = J.lib,
    G = A.WordArray,
    H = A.Hasher,
    A = J.algo,
    E = [], F = 0; 64 > F; F++) {
        E[F] = 4294967296 * I.abs(I.sin(F + 1)) | 0
    }
    A = A.MD5 = H.extend({
        _doReset: function() {
            this._hash = new G.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function(W, Y) {
            for (var AB = 0; 16 > AB; AB++) {
                var AA = Y + AB,
                y = W[AA];
                W[AA] = (y << 8 | y >>> 24) & 16711935 | (y << 24 | y >>> 8) & 4278255360
            }
            var AB = this._hash.words,
            AA = W[Y + 0],
            y = W[Y + 1],
            l = W[Y + 2],
            b = W[Y + 3],
            L = W[Y + 4],
            U = W[Y + 5],
            R = W[Y + 6],
            N = W[Y + 7],
            O = W[Y + 8],
            X = W[Y + 9],
            V = W[Y + 10],
            T = W[Y + 11],
            P = W[Y + 12],
            S = W[Y + 13],
            Q = W[Y + 14],
            M = W[Y + 15],
            s = AB[0],
            Z = AB[1],
            p = AB[2],
            o = AB[3],
            s = B(s, Z, p, o, AA, 7, E[0]),
            o = B(o, s, Z, p, y, 12, E[1]),
            p = B(p, o, s, Z, l, 17, E[2]),
            Z = B(Z, p, o, s, b, 22, E[3]),
            s = B(s, Z, p, o, L, 7, E[4]),
            o = B(o, s, Z, p, U, 12, E[5]),
            p = B(p, o, s, Z, R, 17, E[6]),
            Z = B(Z, p, o, s, N, 22, E[7]),
            s = B(s, Z, p, o, O, 7, E[8]),
            o = B(o, s, Z, p, X, 12, E[9]),
            p = B(p, o, s, Z, V, 17, E[10]),
            Z = B(Z, p, o, s, T, 22, E[11]),
            s = B(s, Z, p, o, P, 7, E[12]),
            o = B(o, s, Z, p, S, 12, E[13]),
            p = B(p, o, s, Z, Q, 17, E[14]),
            Z = B(Z, p, o, s, M, 22, E[15]),
            s = D(s, Z, p, o, y, 5, E[16]),
            o = D(o, s, Z, p, R, 9, E[17]),
            p = D(p, o, s, Z, T, 14, E[18]),
            Z = D(Z, p, o, s, AA, 20, E[19]),
            s = D(s, Z, p, o, U, 5, E[20]),
            o = D(o, s, Z, p, V, 9, E[21]),
            p = D(p, o, s, Z, M, 14, E[22]),
            Z = D(Z, p, o, s, L, 20, E[23]),
            s = D(s, Z, p, o, X, 5, E[24]),
            o = D(o, s, Z, p, Q, 9, E[25]),
            p = D(p, o, s, Z, b, 14, E[26]),
            Z = D(Z, p, o, s, O, 20, E[27]),
            s = D(s, Z, p, o, S, 5, E[28]),
            o = D(o, s, Z, p, l, 9, E[29]),
            p = D(p, o, s, Z, N, 14, E[30]),
            Z = D(Z, p, o, s, P, 20, E[31]),
            s = C(s, Z, p, o, U, 4, E[32]),
            o = C(o, s, Z, p, O, 11, E[33]),
            p = C(p, o, s, Z, T, 16, E[34]),
            Z = C(Z, p, o, s, Q, 23, E[35]),
            s = C(s, Z, p, o, y, 4, E[36]),
            o = C(o, s, Z, p, L, 11, E[37]),
            p = C(p, o, s, Z, N, 16, E[38]),
            Z = C(Z, p, o, s, V, 23, E[39]),
            s = C(s, Z, p, o, S, 4, E[40]),
            o = C(o, s, Z, p, AA, 11, E[41]),
            p = C(p, o, s, Z, b, 16, E[42]),
            Z = C(Z, p, o, s, R, 23, E[43]),
            s = C(s, Z, p, o, X, 4, E[44]),
            o = C(o, s, Z, p, P, 11, E[45]),
            p = C(p, o, s, Z, M, 16, E[46]),
            Z = C(Z, p, o, s, l, 23, E[47]),
            s = K(s, Z, p, o, AA, 6, E[48]),
            o = K(o, s, Z, p, N, 10, E[49]),
            p = K(p, o, s, Z, Q, 15, E[50]),
            Z = K(Z, p, o, s, U, 21, E[51]),
            s = K(s, Z, p, o, P, 6, E[52]),
            o = K(o, s, Z, p, b, 10, E[53]),
            p = K(p, o, s, Z, V, 15, E[54]),
            Z = K(Z, p, o, s, y, 21, E[55]),
            s = K(s, Z, p, o, O, 6, E[56]),
            o = K(o, s, Z, p, M, 10, E[57]),
            p = K(p, o, s, Z, R, 15, E[58]),
            Z = K(Z, p, o, s, S, 21, E[59]),
            s = K(s, Z, p, o, L, 6, E[60]),
            o = K(o, s, Z, p, T, 10, E[61]),
            p = K(p, o, s, Z, l, 15, E[62]),
            Z = K(Z, p, o, s, X, 21, E[63]);
            AB[0] = AB[0] + s | 0;
            AB[1] = AB[1] + Z | 0;
            AB[2] = AB[2] + p | 0;
            AB[3] = AB[3] + o | 0
        },
        _doFinalize: function() {
            var L = this._data,
            P = L.words,
            M = 8 * this._nDataBytes,
            O = 8 * L.sigBytes;
            P[O >>> 5] |= 128 << 24 - O % 32;
            var N = I.floor(M / 4294967296);
            P[(O + 64 >>> 9 << 4) + 15] = (N << 8 | N >>> 24) & 16711935 | (N << 24 | N >>> 8) & 4278255360;
            P[(O + 64 >>> 9 << 4) + 14] = (M << 8 | M >>> 24) & 16711935 | (M << 24 | M >>> 8) & 4278255360;
            L.sigBytes = 4 * (P.length + 1);
            this._process();
            L = this._hash;
            P = L.words;
            for (M = 0; 4 > M; M++) {
                O = P[M],
                P[M] = (O << 8 | O >>> 24) & 16711935 | (O << 24 | O >>> 8) & 4278255360
            }
            return L
        },
        clone: function() {
            var L = H.clone.call(this);
            L._hash = this._hash.clone();
            return L
        }
    });
    J.MD5 = H._createHelper(A);
    J.HmacMD5 = H._createHmacHelper(A)
})(Math); (function() {
    var B = CryptoJS,
    D = B.lib,
    E = D.Base,
    A = D.WordArray,
    D = B.algo,
    C = D.EvpKDF = E.extend({
        cfg: E.extend({
            keySize: 4,
            hasher: D.MD5,
            iterations: 1
        }),
        init: function(F) {
            this.cfg = this.cfg.extend(F)
        },
        compute: function(J, F) {
            for (var H = this.cfg,
            N = H.hasher.create(), K = A.create(), M = K.words, G = H.keySize, H = H.iterations; M.length < G;) {
                I && N.update(I);
                var I = N.update(J).finalize(F);
                N.reset();
                for (var L = 1; L < H; L++) {
                    I = N.finalize(I),
                    N.reset()
                }
                K.concat(I)
            }
            K.sigBytes = 4 * G;
            return K
        }
    });
    B.EvpKDF = function(H, F, G) {
        return C.create(G).compute(H, F)
    }
})();
CryptoJS.lib.Cipher ||
function(M) {
    var C = CryptoJS,
    F = C.lib,
    E = F.Base,
    O = F.WordArray,
    N = F.BufferedBlockAlgorithm,
    A = C.enc.Base64,
    K = C.algo.EvpKDF,
    L = F.Cipher = N.extend({
        cfg: E.extend(),
        createEncryptor: function(Q, P) {
            return this.create(this._ENC_XFORM_MODE, Q, P)
        },
        createDecryptor: function(Q, P) {
            return this.create(this._DEC_XFORM_MODE, Q, P)
        },
        init: function(R, Q, P) {
            this.cfg = this.cfg.extend(P);
            this._xformMode = R;
            this._key = Q;
            this.reset()
        },
        reset: function() {
            N.reset.call(this);
            this._doReset()
        },
        process: function(P) {
            this._append(P);
            return this._process()
        },
        finalize: function(P) {
            P && this._append(P);
            return this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function(P) {
            return {
                encrypt: function(Q, R, S) {
                    return ("string" == typeof R ? G: I).encrypt(P, Q, R, S)
                },
                decrypt: function(Q, R, S) {
                    return ("string" == typeof R ? G: I).decrypt(P, Q, R, S)
                }
            }
        }
    });
    F.StreamCipher = L.extend({
        _doFinalize: function() {
            return this._process(!0)
        },
        blockSize: 1
    });
    var H = C.mode = {},
    J = function(R, Q, P) {
        var T = this._iv;
        T ? this._iv = M: T = this._prevBlock;
        for (var S = 0; S < P; S++) {
            R[Q + S] ^= T[S]
        }
    },
    B = (F.BlockCipherMode = E.extend({
        createEncryptor: function(Q, P) {
            return this.Encryptor.create(Q, P)
        },
        createDecryptor: function(Q, P) {
            return this.Decryptor.create(Q, P)
        },
        init: function(Q, P) {
            this._cipher = Q;
            this._iv = P
        }
    })).extend();
    B.Encryptor = B.extend({
        processBlock: function(R, Q) {
            var P = this._cipher,
            S = P.blockSize;
            J.call(this, R, Q, S);
            P.encryptBlock(R, Q);
            this._prevBlock = R.slice(Q, Q + S)
        }
    });
    B.Decryptor = B.extend({
        processBlock: function(R, Q) {
            var P = this._cipher,
            T = P.blockSize,
            S = R.slice(Q, Q + T);
            P.decryptBlock(R, Q);
            J.call(this, R, Q, T);
            this._prevBlock = S
        }
    });
    H = H.CBC = B;
    B = (C.pad = {}).Pkcs7 = {
        pad: function(R, P) {
            for (var U = 4 * P,
            U = U - R.sigBytes % U,
            S = U << 24 | U << 16 | U << 8 | U,
            Q = [], T = 0; T < U; T += 4) {
                Q.push(S)
            }
            U = O.create(Q, U);
            R.concat(U)
        },
        unpad: function(P) {
            P.sigBytes -= P.words[P.sigBytes - 1 >>> 2] & 255
        }
    };
    F.BlockCipher = L.extend({
        cfg: L.cfg.extend({
            mode: H,
            padding: B
        }),
        reset: function() {
            L.reset.call(this);
            var Q = this.cfg,
            P = Q.iv,
            Q = Q.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                var R = Q.createEncryptor
            } else {
                R = Q.createDecryptor,
                this._minBufferSize = 1
            }
            this._mode = R.call(Q, this, P && P.words)
        },
        _doProcessBlock: function(Q, P) {
            this._mode.processBlock(Q, P)
        },
        _doFinalize: function() {
            var Q = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                Q.pad(this._data, this.blockSize);
                var P = this._process(!0)
            } else {
                P = this._process(!0),
                Q.unpad(P)
            }
            return P
        },
        blockSize: 4
    });
    var D = F.CipherParams = E.extend({
        init: function(P) {
            this.mixIn(P)
        },
        toString: function(P) {
            return (P || this.formatter).stringify(this)
        }
    }),
    H = (C.format = {}).OpenSSL = {
        stringify: function(Q) {
            var P = Q.ciphertext;
            Q = Q.salt;
            return (Q ? O.create([1398893684, 1701076831]).concat(Q).concat(P) : P).toString(A)
        },
        parse: function(Q) {
            Q = A.parse(Q);
            var P = Q.words;
            if (1398893684 == P[0] && 1701076831 == P[1]) {
                var R = O.create(P.slice(2, 4));
                P.splice(0, 4);
                Q.sigBytes -= 16
            }
            return D.create({
                ciphertext: Q,
                salt: R
            })
        }
    },
    I = F.SerializableCipher = E.extend({
        cfg: E.extend({
            format: H
        }),
        encrypt: function(R, P, T, S) {
            S = this.cfg.extend(S);
            var Q = R.createEncryptor(T, S);
            P = Q.finalize(P);
            Q = Q.cfg;
            return D.create({
                ciphertext: P,
                key: T,
                iv: Q.iv,
                algorithm: R,
                mode: Q.mode,
                padding: Q.padding,
                blockSize: R.blockSize,
                formatter: S.format
            })
        },
        decrypt: function(Q, P, S, R) {
            R = this.cfg.extend(R);
            P = this._parse(P, R.format);
            return Q.createDecryptor(S, R).finalize(P.ciphertext)
        },
        _parse: function(Q, P) {
            return "string" == typeof Q ? P.parse(Q, this) : Q
        }
    }),
    C = (C.kdf = {}).OpenSSL = {
        execute: function(Q, P, S, R) {
            R || (R = O.random(8));
            Q = K.create({
                keySize: P + S
            }).compute(Q, R);
            S = O.create(Q.words.slice(P), 4 * S);
            Q.sigBytes = 4 * P;
            return D.create({
                key: Q,
                iv: S,
                salt: R
            })
        }
    },
    G = F.PasswordBasedCipher = I.extend({
        cfg: I.cfg.extend({
            kdf: C
        }),
        encrypt: function(P, S, R, Q) {
            Q = this.cfg.extend(Q);
            R = Q.kdf.execute(R, P.keySize, P.ivSize);
            Q.iv = R.iv;
            P = I.encrypt.call(this, P, S, R.key, Q);
            P.mixIn(R);
            return P
        },
        decrypt: function(P, S, R, Q) {
            Q = this.cfg.extend(Q);
            S = this._parse(S, Q.format);
            R = Q.kdf.execute(R, P.keySize, P.ivSize, S.salt);
            Q.iv = R.iv;
            return I.decrypt.call(this, P, S, R.key, Q)
        }
    })
} (); (function() {
    for (var L = CryptoJS,
    Q = L.lib.BlockCipher,
    W = L.algo,
    S = [], N = [], M = [], O = [], E = [], J = [], Y = [], C = [], P = [], R = [], Z = [], X = 0; 256 > X; X++) {
        Z[X] = 128 > X ? X << 1 : X << 1 ^ 283
    }
    for (var V = 0,
    U = 0,
    X = 0; 256 > X; X++) {
        var T = U ^ U << 1 ^ U << 2 ^ U << 3 ^ U << 4,
        T = T >>> 8 ^ T & 255 ^ 99;
        S[V] = T;
        N[T] = V;
        var A = Z[V],
        K = Z[A],
        I = Z[K],
        B = 257 * Z[T] ^ 16843008 * T;
        M[V] = B << 24 | B >>> 8;
        O[V] = B << 16 | B >>> 16;
        E[V] = B << 8 | B >>> 24;
        J[V] = B;
        B = 16843009 * I ^ 65537 * K ^ 257 * A ^ 16843008 * V;
        Y[T] = B << 24 | B >>> 8;
        C[T] = B << 16 | B >>> 16;
        P[T] = B << 8 | B >>> 24;
        R[T] = B;
        V ? (V = A ^ Z[Z[Z[I ^ A]]], U ^= Z[Z[U]]) : V = U = 1
    }
    var D = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
    W = W.AES = Q.extend({
        _doReset: function() {
            for (var F = this._key,
            g = F.words,
            f = F.sigBytes / 4,
            F = 4 * ((this._nRounds = f + 6) + 1), b = this._keySchedule = [], H = 0; H < F; H++) {
                if (H < f) {
                    b[H] = g[H]
                } else {
                    var G = b[H - 1];
                    H % f ? 6 < f && 4 == H % f && (G = S[G >>> 24] << 24 | S[G >>> 16 & 255] << 16 | S[G >>> 8 & 255] << 8 | S[G & 255]) : (G = G << 8 | G >>> 24, G = S[G >>> 24] << 24 | S[G >>> 16 & 255] << 16 | S[G >>> 8 & 255] << 8 | S[G & 255], G ^= D[H / f | 0] << 24);
                    b[H] = b[H - f] ^ G
                }
            }
            g = this._invKeySchedule = [];
            for (f = 0; f < F; f++) {
                H = F - f,
                G = f % 4 ? b[H] : b[H - 4],
                g[f] = 4 > f || 4 >= H ? G: Y[S[G >>> 24]] ^ C[S[G >>> 16 & 255]] ^ P[S[G >>> 8 & 255]] ^ R[S[G & 255]]
            }
        },
        encryptBlock: function(G, F) {
            this._doCryptBlock(G, F, this._keySchedule, M, O, E, J, S)
        },
        decryptBlock: function(F, H) {
            var G = F[H + 1];
            F[H + 1] = F[H + 3];
            F[H + 3] = G;
            this._doCryptBlock(F, H, this._invKeySchedule, Y, C, P, R, N);
            G = F[H + 1];
            F[H + 1] = F[H + 3];
            F[H + 3] = G
        },
        _doCryptBlock: function(AH, AG, AF, AE, AD, z, x, AC) {
            for (var w = this._nRounds,
            AB = AH[AG] ^ AF[0], AA = AH[AG + 1] ^ AF[1], y = AH[AG + 2] ^ AF[2], v = AH[AG + 3] ^ AF[3], u = 4, H = 1; H < w; H++) {
                var o = AE[AB >>> 24] ^ AD[AA >>> 16 & 255] ^ z[y >>> 8 & 255] ^ x[v & 255] ^ AF[u++],
                G = AE[AA >>> 24] ^ AD[y >>> 16 & 255] ^ z[v >>> 8 & 255] ^ x[AB & 255] ^ AF[u++],
                F = AE[y >>> 24] ^ AD[v >>> 16 & 255] ^ z[AB >>> 8 & 255] ^ x[AA & 255] ^ AF[u++],
                v = AE[v >>> 24] ^ AD[AB >>> 16 & 255] ^ z[AA >>> 8 & 255] ^ x[y & 255] ^ AF[u++],
                AB = o,
                AA = G,
                y = F
            }
            o = (AC[AB >>> 24] << 24 | AC[AA >>> 16 & 255] << 16 | AC[y >>> 8 & 255] << 8 | AC[v & 255]) ^ AF[u++];
            G = (AC[AA >>> 24] << 24 | AC[y >>> 16 & 255] << 16 | AC[v >>> 8 & 255] << 8 | AC[AB & 255]) ^ AF[u++];
            F = (AC[y >>> 24] << 24 | AC[v >>> 16 & 255] << 16 | AC[AB >>> 8 & 255] << 8 | AC[AA & 255]) ^ AF[u++];
            v = (AC[v >>> 24] << 24 | AC[AB >>> 16 & 255] << 16 | AC[AA >>> 8 & 255] << 8 | AC[y & 255]) ^ AF[u++];
            AH[AG] = o;
            AH[AG + 1] = G;
            AH[AG + 2] = F;
            AH[AG + 3] = v
        },
        keySize: 8
    });
    L.AES = Q._createHelper(W)
})(); (function(R) {
    var J = R.Base64;
    var E = "2.1.9";
    var S;
    if (typeof module !== "undefined" && module.exports) {
        try {
            S = require("buffer").Buffer
        } catch(G) {}
    }
    var P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var C = function(c) {
        var b = {};
        for (var a = 0,
        Z = c.length; a < Z; a++) {
            b[c.charAt(a)] = a
        }
        return b
    } (P);
    var V = String.fromCharCode;
    var X = function(a) {
        if (a.length < 2) {
            var Z = a.charCodeAt(0);
            return Z < 128 ? a: Z < 2048 ? (V(192 | (Z >>> 6)) + V(128 | (Z & 63))) : (V(224 | ((Z >>> 12) & 15)) + V(128 | ((Z >>> 6) & 63)) + V(128 | (Z & 63)))
        } else {
            var Z = 65536 + (a.charCodeAt(0) - 55296) * 1024 + (a.charCodeAt(1) - 56320);
            return (V(240 | ((Z >>> 18) & 7)) + V(128 | ((Z >>> 12) & 63)) + V(128 | ((Z >>> 6) & 63)) + V(128 | (Z & 63)))
        }
    };
    var K = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var H = function(Z) {
        return Z.replace(K, X)
    };
    var Q = function(c) {
        var b = [0, 2, 1][c.length % 3],
        Z = c.charCodeAt(0) << 16 | ((c.length > 1 ? c.charCodeAt(1) : 0) << 8) | ((c.length > 2 ? c.charCodeAt(2) : 0)),
        a = [P.charAt(Z >>> 18), P.charAt((Z >>> 12) & 63), b >= 2 ? "=": P.charAt((Z >>> 6) & 63), b >= 1 ? "=": P.charAt(Z & 63)];
        return a.join("")
    };
    var L = R.btoa ?
    function(Z) {
        return R.btoa(Z)
    }: function(Z) {
        return Z.replace(/[\s\S]{1,3}/g, Q)
    };
    var O = S ?
    function(Z) {
        return (Z.constructor === S.constructor ? Z: new S(Z)).toString("base64")
    }: function(Z) {
        return L(H(Z))
    };
    var F = function(Z, a) {
        return ! a ? O(String(Z)) : O(String(Z)).replace(/[+\/]/g,
        function(b) {
            return b == "+" ? "-": "_"
        }).replace(/=/g, "")
    };
    var U = function(Z) {
        return F(Z, true)
    };
    var D = new RegExp(["[\xC0-\xDF][\x80-\xBF]", "[\xE0-\xEF][\x80-\xBF]{2}", "[\xF0-\xF7][\x80-\xBF]{3}"].join("|"), "g");
    var T = function(b) {
        switch (b.length) {
        case 4:
            var Z = ((7 & b.charCodeAt(0)) << 18) | ((63 & b.charCodeAt(1)) << 12) | ((63 & b.charCodeAt(2)) << 6) | (63 & b.charCodeAt(3)),
            a = Z - 65536;
            return (V((a >>> 10) + 55296) + V((a & 1023) + 56320));
        case 3:
            return V(((15 & b.charCodeAt(0)) << 12) | ((63 & b.charCodeAt(1)) << 6) | (63 & b.charCodeAt(2)));
        default:
            return V(((31 & b.charCodeAt(0)) << 6) | (63 & b.charCodeAt(1)))
        }
    };
    var B = function(Z) {
        return Z.replace(D, T)
    };
    var A = function(e) {
        var Z = e.length,
        b = Z % 4,
        c = (Z > 0 ? C[e.charAt(0)] << 18 : 0) | (Z > 1 ? C[e.charAt(1)] << 12 : 0) | (Z > 2 ? C[e.charAt(2)] << 6 : 0) | (Z > 3 ? C[e.charAt(3)] : 0),
        a = [V(c >>> 16), V((c >>> 8) & 255), V(c & 255)];
        a.length -= [0, 0, 2, 1][b];
        return a.join("")
    };
    var I = R.atob ?
    function(Z) {
        return R.atob(Z)
    }: function(Z) {
        return Z.replace(/[\s\S]{1,4}/g, A)
    };
    var W = S ?
    function(Z) {
        return (Z.constructor === S.constructor ? Z: new S(Z, "base64")).toString()
    }: function(Z) {
        return B(I(Z))
    };
    var M = function(Z) {
        return W(String(Z).replace(/[-_]/g,
        function(a) {
            return a == "-" ? "+": "/"
        }).replace(/[^A-Za-z0-9\+\/]/g, ""))
    };
    var Y = function() {
        var Z = R.Base64;
        R.Base64 = J;
        return Z
    };
    R.Base64 = {
        VERSION: E,
        atob: I,
        btoa: L,
        fromBase64: M,
        toBase64: F,
        utob: H,
        encode: F,
        encodeURI: U,
        btou: B,
        decode: M,
        noConflict: Y
    };
    if (typeof Object.defineProperty === "function") {
        var N = function(Z) {
            return {
                value: Z,
                enumerable: false,
                writable: true,
                configurable: true
            }
        };
        R.Base64.extendString = function() {
            Object.defineProperty(String.prototype, "fromBase64", N(function() {
                return M(this)
            }));
            Object.defineProperty(String.prototype, "toBase64", N(function(Z) {
                return F(this, Z)
            }));
            Object.defineProperty(String.prototype, "toBase64URI", N(function() {
                return F(this, true)
            }))
        }
    }
    if (R.Meteor) {
        Base64 = R.Base64
    }
})(this);
var Fingerprint = function(A) {
    var B, C;
    B = Array.prototype.forEach;
    C = Array.prototype.map;
    this.each = function(I, H, G) {
        if (I === null) {
            return
        }
        if (B && I.forEach === B) {
            I.forEach(H, G)
        } else {
            if (I.length === +I.length) {
                for (var F = 0,
                D = I.length; F < D; F++) {
                    if (H.call(G, I[F], F, I) === {}) {
                        return
                    }
                }
            } else {
                for (var E in I) {
                    if (I.hasOwnProperty(E)) {
                        if (H.call(G, I[E], E, I) === {}) {
                            return
                        }
                    }
                }
            }
        }
    };
    this.map = function(G, F, E) {
        var D = [];
        if (G == null) {
            return D
        }
        if (C && G.map === C) {
            return G.map(F, E)
        }
        this.each(G,
        function(J, H, I) {
            D[D.length] = F.call(E, J, H, I)
        });
        return D
    };
    if (typeof A == "object") {
        this.hasher = A.hasher;
        this.screen_resolution = A.screen_resolution;
        this.screen_orientation = A.screen_orientation;
        this.canvas = A.canvas;
        this.ie_activex = A.ie_activex
    } else {
        if (typeof A == "function") {
            this.hasher = A
        }
    }
};
Fingerprint.prototype = {
    get: function() {
        var B = [];
        B.push(navigator.userAgent);
        B.push(navigator.language);
        B.push(screen.colorDepth);
        if (this.screen_resolution) {
            var A = this.getScreenResolution();
            if (typeof A !== "undefined") {
                B.push(A.join("x"))
            }
        }
        B.push(new Date().getTimezoneOffset());
        B.push(this.hasSessionStorage());
        B.push(this.hasLocalStorage());
        B.push( !! window.indexedDB);
        if (document.body) {
            B.push(typeof(document.body.addBehavior))
        } else {
            B.push(typeof undefined)
        }
        B.push(typeof(window.openDatabase));
        B.push(navigator.cpuClass);
        B.push(navigator.platform);
        B.push(navigator.doNotTrack);
        B.push(this.getPluginsString());
        if (this.canvas && this.isCanvasSupported()) {
            B.push(this.getCanvasFingerprint())
        }
        B.push(this.getRandom());
        if (this.hasher) {
            return this.hasher(B.join("###"), 31)
        } else {
            return this.murmurhash3_32_gc(B.join("###"), 31)
        }
    },
    murmurhash3_32_gc: function(H, E) {
        var I, J, G, A, D, B, F, C;
        I = H.length & 3;
        J = H.length - I;
        G = E;
        D = 3432918353;
        B = 461845907;
        C = 0;
        while (C < J) {
            F = ((H.charCodeAt(C) & 255)) | ((H.charCodeAt(++C) & 255) << 8) | ((H.charCodeAt(++C) & 255) << 16) | ((H.charCodeAt(++C) & 255) << 24); ++C;
            F = ((((F & 65535) * D) + ((((F >>> 16) * D) & 65535) << 16))) & 4294967295;
            F = (F << 15) | (F >>> 17);
            F = ((((F & 65535) * B) + ((((F >>> 16) * B) & 65535) << 16))) & 4294967295;
            G ^= F;
            G = (G << 13) | (G >>> 19);
            A = ((((G & 65535) * 5) + ((((G >>> 16) * 5) & 65535) << 16))) & 4294967295;
            G = (((A & 65535) + 27492) + ((((A >>> 16) + 58964) & 65535) << 16))
        }
        F = 0;
        switch (I) {
        case 3:
            F ^= (H.charCodeAt(C + 2) & 255) << 16;
        case 2:
            F ^= (H.charCodeAt(C + 1) & 255) << 8;
        case 1:
            F ^= (H.charCodeAt(C) & 255);
            F = (((F & 65535) * D) + ((((F >>> 16) * D) & 65535) << 16)) & 4294967295;
            F = (F << 15) | (F >>> 17);
            F = (((F & 65535) * B) + ((((F >>> 16) * B) & 65535) << 16)) & 4294967295;
            G ^= F
        }
        G ^= H.length;
        G ^= G >>> 16;
        G = (((G & 65535) * 2246822507) + ((((G >>> 16) * 2246822507) & 65535) << 16)) & 4294967295;
        G ^= G >>> 13;
        G = ((((G & 65535) * 3266489909) + ((((G >>> 16) * 3266489909) & 65535) << 16))) & 4294967295;
        G ^= G >>> 16;
        return G >>> 0
    },
    hasLocalStorage: function() {
        try {
            return !! window.localStorage
        } catch(A) {
            return true
        }
    },
    hasSessionStorage: function() {
        try {
            return !! window.sessionStorage
        } catch(A) {
            return true
        }
    },
    isCanvasSupported: function() {
        var A = document.createElement("canvas");
        return !! (A.getContext && A.getContext("2d"))
    },
    isIE: function() {
        if (navigator.appName === "Microsoft Internet Explorer") {
            return true
        } else {
            if (navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) {
                return true
            }
        }
        return false
    },
    getPluginsString: function() {
        if (this.isIE() && this.ie_activex) {
            return this.getIEPluginsString()
        } else {
            return this.getRegularPluginsString()
        }
    },
    getRegularPluginsString: function() {
        return this.map(navigator.plugins,
        function(B) {
            var A = this.map(B,
            function(C) {
                return [C.type, C.suffixes].join("~")
            }).join(",");
            return [B.name, B.description, A].join("::")
        },
        this).join(";")
    },
    getIEPluginsString: function() {
        if (window.ActiveXObject) {
            var A = ["ShockwaveFlash.ShockwaveFlash", "AcroPDF.PDF", "PDF.PdfCtrl", "QuickTime.QuickTime", "rmocx.RealPlayer G2 Control", "rmocx.RealPlayer G2 Control.1", "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "RealPlayer", "SWCtl.SWCtl", "WMPlayer.OCX", "AgControl.AgControl", "Skype.Detection"];
            return this.map(A,
            function(B) {
                try {
                    new ActiveXObject(B);
                    return B
                } catch(C) {
                    return null
                }
            }).join(";")
        } else {
            return ""
        }
    },
    getScreenResolution: function() {
        var A;
        if (this.screen_orientation) {
            A = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height]
        } else {
            A = [screen.height, screen.width]
        }
        return A
    },
    getCanvasFingerprint: function() {
        var C = document.createElement("canvas");
        var B = C.getContext("2d");
        var A = "aq";
        B.textBaseline = "top";
        B.font = "14px 'Arial'";
        B.textBaseline = "alphabetic";
        B.fillStyle = "#f60";
        B.fillRect(125, 1, 62, 20);
        B.fillStyle = "#069";
        B.fillText(A, 2, 15);
        B.fillStyle = "rgba(102, 204, 0, 0.7)";
        B.fillText(A, 4, 17);
        return C.toDataURL()
    },
    getRandom: function() {
        var A = +new Date();
        return A
    }
};
// var CookieUtil = {
//     set: function(B, E, A, D, G, F) {
//         var C = encodeURIComponent(B) + "=" + encodeURIComponent(E);
//         if (A && A instanceof Date) {
//             C += "; expires=" + A.toGMTString()
//         }
//         if (G) {
//             C += "; path=" + G
//         }
//         if (D) {
//             C += "; domain=" + G
//         }
//         if (F) {
//             C += "; secure"
//         }
//         document.cookie = C
//     },
//     get: function(A) {
//         var E = encodeURIComponent(A),
//         D = document.cookie.indexOf(E),
//         C = null;
//         if (D > -1) {
//             var B = document.cookie.indexOf(";", D);
//             if (B == -1) {
//                 B = document.cookie.length
//             }
//             C = document.cookie.substring(D + E.length + 1, B)
//         }
//         return C
//     },
//     unset: function(A, D, B, C) {
//         this.set(A, "", new Date(0), B, D, C)
//     }
// };
var guid = new Fingerprint().get();
// if (!CookieUtil.get("TDC_token")) {
//     guid = new Fingerprint().get();
//     var d = new Date();
//     d.setTime(d.getTime() + (3600 * 24 * 60 * 60 * 1000));
//     CookieUtil.set("TDC_token", guid, d)
// } else {
//     guid = parseInt(CookieUtil.get("TDC_token"), 10)
// }
var g_collectJsonData = {};
g_collectJsonData.keyboards = [];
g_collectJsonData.mousemove = [];
g_collectJsonData.mouseclick = [];
g_collectJsonData.time = [];
var g_startTime = Math.floor((Date.parse(new Date()) / 1000));
var g_curTime = -1;
var g_capAttempCnt = 0;
var g_mouseClickCnt = 0;
var g_mouseMoveCnt = 0;
var g_keyDownCnt = 0;
function getLeft(C) {
    if (C == null) {
        return null
    }
    var B = C;
    var A = B.offsetLeft;
    while (B != null && B.offsetParent != null && B.offsetParent.tagName != "BODY") {
        A = A + B.offsetParent.offsetLeft;
        B = B.offsetParent
    }
    return A
}
function getTop(C) {
    if (C == null) {
        return null
    }
    var B = C;
    var A = B.offsetTop;
    while (B != null && B.offsetParent != null && B.offsetParent.tagName != "BODY") {
        A = A + B.offsetParent.offsetTop;
        B = B.offsetParent
    }
    return A
}
EventListenerEx = {
    add: function(C, B, A) {
        if (document.addEventListener) {
            C.addEventListener(B, A, false)
        } else {
            if (document.attachEvent) {
                C.attachEvent("on" + B, A)
            } else {
                C["on" + B] = A
            }
        }
    },
    remove: function(C, B, A) {
        if (document.removeEventListener) {
            C.removeEventListener(B, A, false)
        } else {
            if (document.detachEvent) {
                C.detachEvent("on" + B, A)
            } else {
                C["on" + B] = null
            }
        }
    }
};
function mouseClick(C) {
    if (g_mouseClickCnt < 10) {
        var B, A;
        if (C.pageX != undefined) {
            B = C.pageX;
            A = C.pageY
        } else {
            B = C.clientX + document.body.scrollLeft - document.body.clientLeft,
            A = C.clientY + document.body.scrollTop - document.body.clientTop
        }
        g_collectJsonData.mouseclick.push({
            t: Math.floor((Date.parse(new Date()) / 1000)) - g_startTime,
            x: Math.floor(B),
            y: Math.floor(A)
        });
        g_mouseClickCnt++
    }
}
function mouseMove(C) {
    if (g_mouseMoveCnt < 10 && g_curTime != Math.floor((Date.parse(new Date()) / 1000))) {
        g_curTime = Math.floor((Date.parse(new Date()) / 1000));
        var B, A;
        if (C.pageX != undefined) {
            B = C.pageX;
            A = C.pageY
        } else {
            B = C.clientX + document.body.scrollLeft - document.body.clientLeft,
            A = C.clientY + document.body.scrollTop - document.body.clientTop
        }
        g_collectJsonData.mousemove.push({
            t: Math.floor((Date.parse(new Date()) / 1000)) - g_startTime,
            x: Math.floor(B),
            y: Math.floor(A)
        });
        g_mouseMoveCnt++
    }
}
EventListenerEx.add(document, "click", mouseClick);
EventListenerEx.add(document, "mousemove", mouseMove);
document.onkeydown = function(A) {
    var B = A || window.event || arguments.callee.caller.arguments[0];
    if (g_keyDownCnt < 30) {
        Array.prototype.push.apply(g_collectJsonData.keyboards, [B.keyCode]);
        g_keyDownCnt++
    }
};
function getBrower() {
    var D = navigator.userAgent.toLowerCase();
    var E = /msie [\d.]+;/gi;
    var B = /firefox\/[\d.]+/gi;
    var A = /chrome\/[\d.]+/gi;
    var C = /safari\/[\d.]+/gi;
    if (D.indexOf("msie") > 0) {
        return D.match(E).join("")
    }
    if (D.indexOf("firefox") > 0) {
        return D.match(B).join("")
    }
    if (D.indexOf("chrome") > 0) {
        return D.match(A).join("")
    }
    if (D.indexOf("safari") > 0 && D.indexOf("chrome") < 0) {
        return D.match(C).join("")
    }
    return "other"
}
function getOs() {
    var B = navigator.userAgent;
    var G = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var H = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (H) {
        return "Mac"
    }
    var E = (navigator.platform == "X11") && !G && !H;
    if (E) {
        return "Unix"
    }
    var D = (String(navigator.platform).indexOf("Linux") > -1);
    var A = B.toLowerCase().match(/android/i) == "android";
    if (D) {
        if (A) {
            return "Android"
        } else {
            return "Linux"
        }
    }
    if (B.toLowerCase().indexOf("like mac os x") > -1) {
        return "IOS"
    }
    if (G) {
        var F = B.indexOf("Windows NT 5.0") > -1 || B.indexOf("Windows 2000") > -1;
        if (F) {
            return "Win2000"
        }
        var K = B.indexOf("Windows NT 5.1") > -1 || B.indexOf("Windows XP") > -1;
        if (K) {
            return "WinXP"
        }
        var C = B.indexOf("Windows NT 5.2") > -1 || B.indexOf("Windows 2003") > -1;
        if (C) {
            return "Win2003"
        }
        var I = B.indexOf("Windows NT 6.0") > -1 || B.indexOf("Windows Vista") > -1;
        if (I) {
            return "WinVista"
        }
        var J = B.indexOf("Windows NT 6.1") > -1 || B.indexOf("Windows 7") > -1;
        if (J) {
            return "Win7"
        }
    }
    return "other"
}
function getTrace() {
    if (arguments.length > 0) {
        g_collectJsonData.refreshCnt = parseInt(arguments[0])
    } else {
        g_collectJsonData.refreshCnt = 0
    }
    g_capAttempCnt++;
    g_collectJsonData.tryCnt = g_capAttempCnt;
    if (navigator.userAgent != "undefined") {
        g_collectJsonData.userAgent = getBrower() == "other" ? navigator.userAgent: getBrower()
    }
    if (typeof(navigator.plugins) != "undefined") {
        g_collectJsonData.pluginNum = navigator.plugins.length
    }
    g_collectJsonData.os = getOs();
    g_collectJsonData.resolution = [];
    Array.prototype.push.apply(g_collectJsonData.resolution, [screen.width, screen.height]);
    g_collectJsonData.time = [];
    Array.prototype.push.apply(g_collectJsonData.time, [g_startTime, Math.floor((Date.parse(new Date()) / 1000))]);
    g_collectJsonData.url = document.location.href;
    g_collectJsonData.guid = guid;
    var D = "0123456789abcdef";
    var C = "0123456789abcdef";
    D = CryptoJS.enc.Utf8.parse(D);
    C = CryptoJS.enc.Utf8.parse(C);
    var E = JSON.stringify(g_collectJsonData);
    E = E.length > 1024 ? E.substring(0, 1024) : E;
    var B = 15 - E.length % 16;
    for (i = 0; i < B; i++) {
        E += " "
    }
    var F = CryptoJS.AES.encrypt(E, D, {
        iv: C,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    g_collectJsonData = {};
    g_collectJsonData.keyboards = [];
    g_collectJsonData.mousemove = [];
    g_collectJsonData.mouseclick = [];
    g_collectJsonData.time = [];
    g_mouseClickCnt = 0;
    g_mouseMoveCnt = 0;
    g_keyDownCnt = 0;
    var A = F.toString();
    A = A.replace(/\+/g, "-");
    A = A.replace(/\//g, "_");
    A = A.replace(/=/g, "*");
    return A.length > 1500 ? A.substring(0, 1500) : A
};
