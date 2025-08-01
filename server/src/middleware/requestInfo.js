const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

const getRequestInfo = (req) => {
  return {
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date()
  };
};

module.exports = { getRequestInfo }; 