var mongoose = require("mongoose");
var morgan = require("morgan");
const URI = "mongodb://localhost/monitor-orders";
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((db) => console.log("DB connected"))
    .catch((err) => console.error(err));
const { Schema } = mongoose;
const OrderSchema = new Schema({}, { strict: false });
var Order = mongoose.model("Order", OrderSchema);
module.exports=Order;