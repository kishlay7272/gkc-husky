const puppeteer = require('puppeteer');
const axios = require('axios');
const { Sequelize, QueryTypes } = require('sequelize');
module.exports = {

    refreshToken: async function(sequelize) {
        branch_details_grubhub = await this.get_branch(sequelize);
        for (let i = 0; i < branch_details_grubhub.length; i++) {
            await this.create_update_token(branch_details_grubhub[i], sequelize);
        }
    },

    get_connection: async function() {
        let sequelize = new Sequelize('mysql://root:p64266426@localhost:3306/mydb');
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
            return sequelize;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

    },

    get_branch: async function get_branch_details(sequelize) {
        try {
            let branch_details = await sequelize.query('SELECT * FROM branch_platform where platform_id="2"', { type: QueryTypes.SELECT });
            return branch_details;
        } catch (error) {
            console.error('Unable to grt branch details', error);

        }

    },

    create_update_token: async function create_update_token(branch_details, sequelize) {
        let timestamp = new Date().getTime();
        let auth = 0;
        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage()
        await page.goto('https://restaurant.grubhub.com/login');
        await page.waitForSelector(".gfr-textfield-text__input");
        await page.type(".gfr-textfield-text__input", branch_details.email);
        await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', branch_details.password)
        await page.click('[type="submit"]')
        await page.waitForNavigation();
        await page.setRequestInterception(true);
        await page.on('response', (async response => {
            auth2 = await response.request().headers()
            if (auth2.authorization && auth2.authorization != auth) {
                auth = auth2.authorization
                let token = auth;
                browser.close();
                let values = token;

                let branch_token = await sequelize.query('SELECT * from session  WHERE Branch_id="2220052"', { type: QueryTypes.SELECT });
                if (branch_token.length == 0) {
                    await sequelize.query('INSERT IGNORE into session (token,platform_id,Branch_id) values(?,?,?)', { replacements: [token, branch_details.platform_id, branch_details.Branch_id], type: QueryTypes.INSERT });
                    return;
                }
                else {
                    await sequelize.query('UPDATE session SET token = ?  WHERE Branch_id="2220052"', { replacements: [token], type: QueryTypes.INSERT });
                }
            }
        }));
    }
}



