
module.exports = {

    transform_Postmatesdata: async function transform(order) {
        items = [];
        for (let i = 0; i < order.order.items.length; i++) {
            let item = {
                item_id: order.order.items[i].uuid,
                item_name: order.order.items[i].name,
                item_price: Number(order.order.items[i].base_price),
                item_quantity: order.order.items[i].quantity
            }
            items.push(item);
        }
        let orders = {
            item: items,
         order_id: order.order.order_number,
         customer_name : order.customer_name,
         customer_phone : "56123456",
         sub_total_charges : order.pricing_line_items[0].value,
         total_tax : order.pricing_line_items[1].value,
         total_charges : order.pricing_line_items[2].value,
        // let item_id = order.restaurantOrder.items[0].uuid;
        // let item_name = order.restaurantOrder.items[0].title;//line.length
        // let item_price = Number(order.restaurantOrder.items[0].price);//ITEMS.LENGTH
        // let item_quantity = order.restaurantOrder.items[0].quantity;
         note : "nothing",
         status : order.order.state,//PICKED_UP_FOOD
         delivery_person_name : order.courier_name,
         delivery_person_phone :"NULL",
         placed_time : order.created_dt,
         order_count : order.order.items.length,
         platform_name : "Postmates",
         est_delivery : order.pickup_eta
        }
         let transformed_data = [orders];
        return transformed_data;
    }
}




                                            // left={Restaurant_Name,platform_name,}
                                            // Order Page:
                                            // OrderID+
                                            // Customer_Name+
                                            // Restaurant_Name-
                                            // Item_Name+
                                            // Note-//add customisation in orders-
                                            // Status-
                                            // Platform_Name-
                                            // No. of items-

                                            // OrderInfo Page:
                                            // Courier Tab-
                                            // Platform_Name
                                            // Delivery guy name-
                                            // Delivery guy phone no.
                                            // Status
                                            // Customer Tab-
                                            // Customer_Name
                                            // Customer_PhoneNo-
                                            // Address if available//add customer address
                                            // Right Column:
                                            // No. of items -
                                            // Customer Name+
                                            // Items_Name+
                                            // Item_price+
                                            // Item_Quantity-
                                            // Note-
                                            // Subtotal+
                                            // Tax+
                                            // Total+
                                            // Platform name+
                                            // Order_ID+
                                            // Placed On-//add order_time in order-
                                            // Status
                                            // Collapse

                                            // gkc/getOrders----all order info with filters and pagination;

                                            // gkc/getOrderDetails----all order info with filters and pagination;


                                            // gkc/confirm;---to confirm order;

                                            // gkc/pickup_ready;---to make orders ready for pickup;


                                            // gkc/completed;----for completed orders;











                                            // let grubhub_item = [item_id, item_name, item_price, item_quantity, grubhub_orders[0].order_number];
