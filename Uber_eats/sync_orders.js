const transformer = require('./transformer');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require("node-fetch");
const { Sequelize, QueryTypes } = require('sequelize');
var dbConn_mongo = require('./../mongo');


module.exports = {
    getorders: async function getorders(branch_cookie, sequelize) {
        let active_order_url = await "https://restaurant-dashboard.uber.com/rt/eats/v1/stores/" + branch_cookie.branch_id + "/active-orders"
        let transport = axios.create({ withCredentials: true });
        let res = await transport.get(active_order_url, {
            headers: {
                'accept': '*/*',
                'cookie': branch_cookie.cookies
            }
        })
        let data1 = await res.data.orders;
        if (data1) {
            if (data1.length > 0) {
                for (i = 0; i < data1.length; i++) {
                    await dbConn_mongo.updateOne(
                        { uuid: data1[i].restaurantOrder.uuid },
                        data1[i],
                        { upsert: true })

                    let transformed_uber_data = await transformer.transform_Uberdata(data1[i]);//transforming active orders
                    await this.store_orders(transformed_uber_data[0], sequelize, branch_cookie);
                    return transformed_uber_data;
                }
            }
            else return [];
        }
        else return [];

    },
    store_orders: async function store_orders(orders, sequelize, branch_details) {
        try {
            await sequelize.query('SET FOREIGN_KEY_CHECKS=0');
            await sequelize.query('REPLACE into customer (customer_id,Name,phone) values(?,?,?)', { replacements: [orders.order_id, orders.customer_name, orders.customer_phone], type: QueryTypes.INSERT });
            await sequelize.query('REPLACE  into `order` (order_id,sub_total,tax,total,Branch_id,platform_id,customer_id,status,note) values(?,?,?,?,?,?,?,?,?)', { replacements: [orders.order_id, orders.sub_total_charges, orders.total_tax, orders.total_charges, branch_details.branch_id, "1", orders.order_id, orders.status, orders.note], type: QueryTypes.INSERT });
            for (let i = 0; i < orders.item.length; i++) {
                await sequelize.query('REPLACE  into item (item_id,item_name,price,quantity,order_id) values(?,?,?,?,?)', { replacements: [orders.item[i].item_id, orders.item[i].item_name, orders.item[i].item_price, orders.item[i].item_quantity, orders.order_id], type: QueryTypes.INSERT });
            }
            if (orders.delivery_person_name)
                await sequelize.query('REPLACE  into `delivery` (Delivery_id,`Name`,mobile,order_id) values(?,?,?,?)', { replacements: [orders.order_id, orders.delivery_person_name, orders.delivery_person_phone, orders.order_id], type: QueryTypes.INSERT });

        } catch (error) {
            console.log(error);
        }

    }
}