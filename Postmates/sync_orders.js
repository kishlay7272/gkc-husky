const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require("node-fetch");
const transformer = require('./transformer');
const { Sequelize, QueryTypes } = require('sequelize');
module.exports = {
    getorders: async function getorders(branch_token, branch_details, sequelize) {
        try {
            let url = "https://merchant.postmates.com/v1/merchant_places/" + branch_details.place_uuid + "/jobs";
            let order_data = await fetch(url, {
                method: "get",
                headers: {
                    'authorization': branch_token.token,
                    'host': 'merchant.postmates.com',
                    'user-agent': 'MerchantAndroid 6.2.8 rv:60208 (device_model:SM-T510; system_os:Android; system_version:10; en_GB)'
                }
            })
            let data = await order_data.json();
            if (data.jobs.length) {
                for (let i = 0; i < data.jobs.length; i++) {
                    let transformed_data = await transformer.transform_Postmatesdata(active_order_data[i]);
                    await this.store_orders(transformed_data, sequelize, branch_details);
                }
            }
            else return ([]);
        }
        catch (e) {
            console.log(e);
        }

    },

    store_orders: async function store_orders(orders, sequelize, branch_details) {
        try {
            await sequelize.query('REPLACE into customer (customer_id,Name,phone) values(?,?,?)', { replacements: [orders.customer_id, orders.customer_name, orders.customer_phone], type: QueryTypes.INSERT });
            await sequelize.query('REPLACE into `order` (order_id,sub_total,tax,total,Branch_id,platform_id,customer_id,status,note) values(?,?,?,?,?,?,?,?,?)', { replacements: [orders.order_id, orders.sub_total_charges, orders.total_tax, orders.total_charges, branch_details.branch_id, "3", orders.customer_id, orders.status, orders.note], type: QueryTypes.INSERT });
            for (let i = 0; i < orders.item.length; i++) {
                await sequelize.query('REPLACE into item (item_id,item_name,price,quantity,order_id) values(?,?,?,?,?)', { replacements: [orders.item[i].item_id, orders.item[i].item_name, orders.item[i].item_price, orders.item[i].item_quantity, orders.order_id], type: QueryTypes.INSERT });
            }
            await sequelize.query('REPLACE into `delivery` (Name,mobile,order_id) values(?,?,?)', { replacements: [orders.delivery_person_name, orders.delivery_person_phone, orders.order_id], type: QueryTypes.INSERT });
        } catch (error) {
            console.log(error);
        }

    }

}