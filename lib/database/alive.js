const {
    Sequelize,
    DataTypes
} = require("sequelize");
const config = require('../../config');

const methods = ['get', 'set', 'add','delete'];
const types = [{'mention': 'object'}, {'ban': 'string'}, {'alive': 'string'}, {'login': 'string'}, {'shutoff': 'string'}, {'owner_updt': 'string'}, {'commit_key': 'string'}, {'sticker_cmd': 'object'}, {'plugins': 'object'}, {'toggle': 'object'}];

function jsonConcat(o1, o2) {
 for (const key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}

const personalDb = config.DATABASE.define("personalDB", {
    mention: {
        type: DataTypes.STRING(2500),
        allowNull: true
    },
    ban: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    alive: {
        type: DataTypes.STRING(2500),
        allowNull: true,
        defaultValue: 'Im alive\nsend .alive your msg to update alive msg.\ntype alive get to see alive msg.'
    },
    login: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shutoff: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    owner_updt: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    commit_key: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sticker_cmd: {
        type: DataTypes.STRING(2500),
        allowNull: true,
        defaultValue: '{}'
    },
    plugins: {
        type: DataTypes.STRING(2500),
        allowNull: true,
        defaultValue: '{}'
    },
    toggle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '{}'
    }
});

async function getAlive(type, options, method) {
    if (!Array.isArray(type)) return;
    if (typeof options != 'object') return;
    let filter = type.map(t => types.filter(a => a[t])[0])
    if (!filter || !filter[0]) return;
    if (method == 'set' || method == 'add' || method == 'delete') {
        filter = filter[0];
        type = type[0]
    } else filter = filter.filter(a => a != undefined)
    if (method == 'set' && typeof options.content != filter[type]) return;
    if (!methods.includes(method)) return;
    let data = await personalDb.findOne();
    if (!data) {
        if (method == 'set') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(options.content);
            await personalDb.create({
                [type]: options.content
            })
            return true;
        } else if (method == 'add') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(options.content);
            data = await personalDb.create({
                [type]: options.content
            })
            return convert_required ? JSON.parse(data.dataValues[type]) : data.dataValues[type];
        } else if (method == 'delete') {
            return false;
        } else {
            const msg = {};
            type.map(a=>{
                msg[a] = false;
            })
          return msg;
        }
    } else {
        if (method == 'set') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(options.content);
            await data.update({
                [type]: options.content
            })
            return true;
        } else if (method == 'add') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(jsonConcat(JSON.parse(data.dataValues[type]), options.content))
            await data.update({
                [type]: options.content
            })
            return convert_required ? JSON.parse(data.dataValues[type]) : data.dataValues[type];
        } else if (method == 'delete') {
            if (!options.content.id) return;
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) {
                const json = JSON.parse(data.dataValues[type]);
                if (!json[options.content.id]) return false;
                delete json[options.content.id];
                options.content = JSON.stringify(json);
            }
            await data.update({
                [type]: options.content
            })
            return true;
        } else {
            const msg = {};
            filter.map(t => {
                const v = Object.keys(t)[0];
                const convert_required = t[v] == 'object' ? true : false;
                const value = convert_required ? JSON.parse(data.dataValues[v]) : data.dataValues[v]
                msg[v] = value;
            })
            return msg;
        }
    }
}
module.exports = {getAlive};
