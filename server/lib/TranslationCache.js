const Sequelize = require('sequelize');
const {storage, loggingSql} = require('./argv');

const db = new Sequelize('cache', '', '', {
    dialect: 'sqlite',
    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: loggingSql,
    storage: storage
});


const normalize = (str) => (typeof str === 'string') ? str.trim().toLowerCase() : '';

module.exports = class TranslationCache{
    constructor(name) {
        this.name = name;
    }
    async initialize() {
        this.model = await db.define(this.name, {
            from: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            to: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            source: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            target: Sequelize.JSON,
            time: {
                type: Sequelize.DATE
            }
        }).sync();
        return this;
    }
    /**
     * 
     * @param {string} from 
     * @param {string} to 
     * @param {string} source 
     * @returns {Promise<{basic:object,query:string, speakUrl:string, tSpeakUrl:string, translation: string[], web:object}>}
     */
    async getCache(from, to, source) {
        from = normalize(from);
        to = normalize(to);
        source = normalize(source);
        let raw = await this.model.findOne({
            where: {from, to, source}
        });
        if(raw && Date.now() - raw.time > 1000 * 3600 * 24 * 2 ) {
            this.model.destroy({
                where: {from, to, source}
            });
            return null;
        } else {
            return raw;
        }
    }
    async putCache(from, to, source, target) {
        return await db.transaction(t => {
            return this.model.create({
                from: normalize(from), 
                to: normalize(to),
                source: normalize(source),
                target: target,
                time: new Date()
            }, {transaction: t});
        })
    }
};