import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/notesDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");

        const onListening = () => {
            console.log(`Server running on port ${PORT}`);
        };

        app.listen(PORT, onListening);

    } catch (error) {
        console.error("error:", error);
        throw error;
    }
})();