import jwt from 'jsonwebtoken'
function verifyToken(req, res, next)
{
    const token=req.cookies.token;
    if(!token)
    {
       
        return res.status(401).json({message:"Unauthorised : No token provided"});
    }
    try{
          const decode= jwt.verify(token, "sdkjsdjksdjdsjksdjds");
            req.user=decode.email;
            next();
    }
    catch(err)
    {
        return res.status(403).json({message:"Forbidden token"});
    }
}
export default verifyToken;