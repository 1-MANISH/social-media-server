
const mongoose = require('mongoose')

module.exports = async () => {

    const mongoUrl =   `mongodb+srv://manish:LL1o92TdkO0s8FUp@cluster0.hl0d1k0.mongodb.net/?retryWrites=true&w=majority`

    try {

        const connect  = await mongoose.connect(
            mongoUrl,
            { useNewUrlParser: true,
              useUnifiedTopology: true
            }
        )

        console.log(`MongoDb Connected ${connect.connection.host}`);

        
    } catch (error) {

        console.log(error);
        process.exit(1)

    }

    
}