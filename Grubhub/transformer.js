module.exports = {

    grubhub_transformer: async function transform(order) {
        let items = [];
        let delivery_person_name = "";
        let delivery_person_phone = "";
        let delivery_id = "";
        let status="";
        for (let i = 0; i < order.diners[0].lines.length; i++) {
            let item = {
                item_id: order.diners[0].lines[i].id,
                item_name: order.diners[0].lines[i].name,
                item_price: order.diners[0].lines[i].price,
                item_quantity: order.diners[0].lines[i].quantity
            }
            items.push(item);
        }

        if (order.delivery.deliver_info) {
            if (order.delivery.deliver_info.courier) {
                delivery_id = order.delivery.delivery_id
                delivery_person_name = order.delivery.deliver_info.courier.name;
                delivery_person_phone = order.delivery.deliver_info.courier.phone;
            }
        }
        if (order.status) {
            if (order.status == "RESTAURANT_CONFIRMABLE") {
                status = "active"
            }
            else if (order.status == "CONFIRMED") {
                status = "confirmed"
            }
            else if (order.status == "PICKUP_READY") {
                status = "ready"
            }
        }

        let orders = {
            item: items,
            order_id: order.order_number,
            short_merchant_id:order.short_merchant_id,
            legacyId:order.uuid,
            customer_name: order.contact_info.name,
            customer_id: order.diners[0].diner_uuid,
            customer_phone: order.contact_info.phone,
            sub_total_charges: order.charges.sub_total,
            total_tax: order.charges.taxes.total,
            total_charges: order.charges.total,
            note: order.special_instructions,
            status: status,
            delivery_id: delivery_id,
            delivery_person_name: delivery_person_name,//todo delivery info
            delivery_person_phone: delivery_person_phone,//todo delivery person
            placed_time: order.received_at,
            order_count: order.items_count,
            platform_name: order.brand,
            est_delivery: order.delivery.estimated_delivered
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
