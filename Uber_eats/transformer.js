
module.exports = {

    transform_Uberdata: async function transform(order) {
        items = [];
        let charges = order.restaurantOrder.checkoutInfo;
        let state = order.status.orderJob.stateChanges;
        let order_status,note="";
        let deliveryPersonName="";
        let deliveryPersonPhone=""
        for (key in state) {
            if (state[key].type == "CREATED")
                order_status = "active"
            else if (state[key].type == "ACCEPTED")
                order_status = "confirmed";

            else if (state[key].type == "READY_FOR_PICKUP")
                order_status = "ready";
            else if (order.deliveryJobDetails[0].jobStateSummary.currentState)
                order_status = order.deliveryJobDetails[0].jobStateSummary.currentState.type;
        }
        let total_charge, tax, subtotal;
        for (key in charges) {
            if (charges[key].key == "total");
            total_charge = charges[key].value
            if (charges[key].key == "tax")
                tax = charges[key].value
            if (charges[key].key == "subtotal")
                subtotal = charges[key].value
        }

        for (let i = 0; i < order.restaurantOrder.items.length; i++) {
            let item = {
                item_id: order.restaurantOrder.items[i].uuid,//done
                item_name: order.restaurantOrder.items[i].title,
                item_price: Number(order.restaurantOrder.items[i].price),
                item_quantity: order.restaurantOrder.items[i].quantity
            }
            items.push(item);
        }
        if(order.restaurantOrder.deliveryInstructions)
        {
            note=order.restaurantOrder.deliveryInstructions
        }
        if(order.deliveryJobDetails[0].courierInfo)
        {
        deliveryPersonName=order.deliveryJobDetails[0].courierInfo.courier.name;
        deliveryPersonPhone=order.deliveryJobDetails[0].courierInfo.courier.mobileDigits;
        }

        let orders = {
            item: items,
            order_id: order.restaurantOrder.displayId,//done
            customer_name: order.restaurantOrder.customerInfo.firstName,//done
            customer_phone: order.restaurantOrder.customerInfo.phone,//done
            sub_total_charges: subtotal,//done
            total_tax: tax,//done
            total_charges: total_charge,//done
            note: note,//todo:to check if note is there
            status: order_status,//PICKED_UP_FOOD//change
            delivery_person_name: deliveryPersonName,//done
            delivery_person_phone: deliveryPersonPhone,//done
            placed_time: order.restaurantOrder.createdAt,//timestamp value//tod:convert into commontype
            order_count: order.restaurantOrder.items.length,//done
            platform_name: "Uber-eats",//done
            est_delivery: "145678678566"//order.deliveryJobDetails[0].estimatedTimes.estimatedDeliveryTime//timestamp://todo convert into common time
        }
        let transformed_data = [orders];
        return transformed_data;
    }
}
// let delivery_status=order.deliveryJobDetails[0].jobStateSummary.currentState.type



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
