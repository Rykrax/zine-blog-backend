import jwt from 'jsonwebtoken'

const generateToken = async (payload, secretKey, tokenLife) => {
    try {
        return jwt.sign(payload, secretKey, { algorithm: "HS256", expiresIn: tokenLife });
    } catch (err) { throw new Error(err); }
}

const verifyToken = async (token, secretKey) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) { throw new Error(err); }
}

export const jwtProvider = {
    generateToken,
    verifyToken
}

