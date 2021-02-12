const { Sequelize, QueryTypes } = require('sequelize');

module.exports={
    get_branch: async function get_branch_details(sequelize) {
        try {
            let branch_details = await sequelize.query('SELECT * FROM branch_platform where platform_id="3"', { type: QueryTypes.SELECT });
            return branch_details;
        } catch (error) {
            console.error('Unable to grt branch details', error);

        }

    }
}
// module.exports={postmates};