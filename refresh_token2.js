const puppeteer = require('puppeteer');
const axios = require('axios');
const { Sequelize, QueryTypes } = require('sequelize');
module.exports = {

    get_branch: async function get_branch_details(sequelize) {
        try {
            let branch_details = await sequelize.query('SELECT * FROM branch_platform where platform_id="1"', { type: QueryTypes.SELECT });
            return branch_details;
        } catch (error) {
            console.error('Unable to grt branch details', error);

        }

    },

    create_update_cookie: async function create_update_token(branch_details, sequelize) {
        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage()
        let Branch_id = await branch_details.Branch_id;
        await page.goto('https://restaurant-dashboard.uber.com/');
        await page.waitForSelector("#useridInput")
        await page.type("#useridInput", branch_details.email);
        await page.click('.btn.btn--arrow.btn--full')
        await page.waitForNavigation({ timeout: 100000 });
        await page.waitForSelector("#password");
        await page.type("#password", branch_details.password);
        await page.click(".btn.btn--arrow.btn--full.push--top");
        await page.waitForNavigation({ timeout: 100000 });
        let cookies= await page.cookies();
        let cookie = cookies.map(item => `${item.name}=${item.value}`).join('; ');
        await browser.close();
        let branch_token = await sequelize.query('SELECT * from session  WHERE Branch_id="2220052"', { type: QueryTypes.SELECT });
        if (branch_token.length == 0) {
            await sequelize.query('INSERT IGNORE into session (cookie,platform_id,Branch_id) values(?,?,?)', { replacements: [cookie, branch_details.platform_id, branch_details.Branch_id], type: QueryTypes.INSERT });
            return;
        }
        else {
            await sequelize.query('UPDATE session SET cookie = ?  WHERE Branch_id=?', { replacements: [cookie,branch_details.Branch_id], type: QueryTypes.INSERT });
        }
        
    }
}



