import jwt from 'jsonwebtoken'
export const generateToken = (id,role)=>{
    try {
        const token = jwt.sign({id,role},process.env.SECRET_KEY,{expiresIn:"30m"})
        return token
    } catch (error) {
        console.log(error)
    }
}