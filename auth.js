
const jwt = require('jsonwebtoken');
 
function checkAuth(req, res, next)
{
	const token = req.headers.authorization;
	if(!token)
	{
		return res.status(401).json({error:'You have to be connected to access this page !'});
	}
	const decodedToken = jwt.verify(token, 'clientsdgkh56k46g723sq568etfgfd3sgfdy5s7q564f2T');
	const userId = decodedToken.userId;
	if (req.body.userId && req.body.userId !== userId) 
	{
		return res.status(401).json({error:'Invalid token!'});
	} 
	next();
}
function checkAdmin(req, res, next)
{
	const token = req.headers.authorization;
	if(!token)
	{
		return res.status(401).json({error:'You have to be connected to access this page !'});
	}
	const decodedToken = jwt.verify(token, 'adminsdgkh56k46g723sq568etfgfd3sgfdy5s7q564f2T');
	const userId = decodedToken.userId;
	if (req.body.userId && req.body.userId !== userId) 
	{
		return res.status(401).json({error:'Invalid token!'});
	} 
	next();
}
module.exports = {checkAuth: checkAuth, checkAdmin: checkAdmin};