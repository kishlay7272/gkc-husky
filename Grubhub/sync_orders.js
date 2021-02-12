const puppeteer = require('puppeteer');
const axios = require('axios');
const { Sequelize, QueryTypes } = require('sequelize');
const transform = require('./transformer');
var dbConn_mongo = require('./../mongo');

module.exports = {
    getorders: async function getorders(branch_token, sequelize) {
        try {
            let timestamp = new Date().getTime() - 300000;
            let url = "https://api-gtm.grubhub.com/merchant/2220052,2220818,2218384,2219349,2221715,2218188,2221811,2218970/orders?timestamp=" + timestamp;
            //   let url="https://api-gtm.grubhub.com/merchant/2220052,2220818,2218384,2219349,2221715,2218188,2221811,2218970/orders?tab=OUT_THE_DOOR&offset=0&limit=5"
            let res = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'authorization': branch_token.token,
                    'origin': 'https://restaurant.grubhub.com'
                }
            }).catch(err => {
                console.log("error in await", err);
            })
            let data = await res.data;
            if (data) {
                for (let key in data) {
                    if (typeof data[key] === 'object') {
                    if (data[key].orders) {
                        let grubhub_orders =  data[key].orders;
                        if (grubhub_orders.length > 0) {
                            for (let i = 0; i < grubhub_orders.length; i++) {
                                // return(grubhub_orders[i]);
                                await dbConn_mongo.updateOne(
                                    { order_number:  grubhub_orders[i].order_number},
                                    grubhub_orders[i],
                                    { upsert: true })
                                let transform_data = await transform.grubhub_transformer(grubhub_orders[i]);
                                await this.store_orders(transform_data[0], sequelize, branch_token);
                            }
                        }
                       
                    }
                }
                }
                return ([]);
            }
            else return ([]);
        }
        catch (error) {
            console.log(error);
        }
    },
    store_orders: async function store_orders(orders, sequelize, branch_details) {
        try {
            await sequelize.query('SET FOREIGN_KEY_CHECKS=0');

            await sequelize.query('REPLACE  into customer (customer_id,Name,phone) values(?,?,?)', { replacements: [orders.customer_id, orders.customer_name, orders.customer_phone], type: QueryTypes.INSERT });
            await sequelize.query('REPLACE into `order` (order_id,sub_total,tax,total,Branch_id,platform_id,customer_id,status,note,short_merchant_id,legacy_id) values(?,?,?,?,?,?,?,?,?,?,?)', { replacements: [orders.order_id, orders.sub_total_charges, orders.total_tax, orders.total_charges, branch_details.branch_id, "1", orders.customer_id, orders.status, orders.note,orders.short_merchant_id,orders.legacyId], type: QueryTypes.INSERT });
            console.log(orders.item.length);
            for (let i = 0; i < orders.item.length; i++) {
                await sequelize.query('REPLACE into item (item_id,item_name,price,quantity,order_id) values(?,?,?,?,?)', { replacements: [orders.item[i].item_id, orders.item[i].item_name, orders.item[i].item_price, orders.item[i].item_quantity, orders.order_id], type: QueryTypes.INSERT });
            }
            if (orders.delivery_person_name)
            await sequelize.query('REPLACE  into `delivery` (Delivery_id,`Name`,mobile,order_id) values(?,?,?,?)', { replacements: [orders.delivery_id, orders.delivery_person_name, orders.delivery_person_phone, orders.order_id], type: QueryTypes.INSERT });
            console.log("executed");
    } catch (error) {
            console.log(error);
        }

    }
}