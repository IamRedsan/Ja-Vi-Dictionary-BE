class NotFoundError extends Error{
    constructor(message){
        super(message);
        
        Error.captureStackTrace(this, this.constructor);
        
        this.name = this.constructor.name;
        this.statusCode = 404;
    }

    statusCode(){
        return this.statusCode;
    }
}

export default NotFoundError;