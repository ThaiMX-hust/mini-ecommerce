const mongoose = require("mongoose");

let _mongooseClient

async function mongooseClient(){
    if(!_mongooseClient){
        _mongooseClient = await mongoose.connect(process.env.MONGO_DATABASE_URL)
            .then(() => console.log("MongoDB connected"))
            .catch(err => console.log("MongoDB error:", err));
    }

    return _mongooseClient
}

module.exports = {
    mongooseClient
}
