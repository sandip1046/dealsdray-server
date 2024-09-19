// if you have any authenticated requests it needs to flow througn the middleware.
//middleware verify all the authenticated request

const { JWT_SECRET } = require("./config").default;
const jwt = require("jsonwebtoken");


console.log(" before gng to out i came here for authenticated validation")
const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;//taking authorization from the headers

    // this condition checks that whether there is a authorization in the header or not . and it will check whether authorization starts with bearer or not.

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({});
    }

    //Header -
    // Authorization: Bearer <actual token>

    //Checks the headers for an Authorization header (Bearer <token>)

    //this will split the authorization by taking space(" ") as a delimiter.
    //after splitting take the only <actual token> part excluding the bearer.
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET); //decoding the <actual token>.


        //Verifies that the token is valid
        req.userId = decoded.userId; //checking the requested userId and decoded userId

        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

export default authMiddleware;