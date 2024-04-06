const {
    Sequelize,
    DataTypes
} = require("sequelize");
const config = require('../../config');
const methods = ['get', 'set', 'add','delete'];
const types = [{'antibot': 'object'}, {'antidelete': 'string'}, {'antifake': 'object'}, {'antilink': 'object'}, {'antiword': 'object'}, {'antidemote': 'string'}, {'antipromote': 'string'}, {'filter': 'object'}, {'warn': 'object'}, {'welcome': 'object'}, {'exit': 'object'}, {'pdm': 'string'}];

function jsonConcat(o1, o2) {
 for (const key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}

const groupDb = config.DATABASE.define("groupDB", {
    jid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    antibot: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antidelete: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antifake: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    antilink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antiword: {
        type: DataTypes.STRING,
        allowNull: true
    },
    antidemote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    antipromote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
    filter: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '{}'
    },
    warn: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '{}'
    },
    welcome: {
        type: DataTypes.STRING,
        allowNull: true
    },
    exit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pdm: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'false'
    },
});

async function groupDB(type, options, method) {
    if (!Array.isArray(type) || !options.jid) return;
    if (typeof options != 'object') return;
    let filter = type.map(t => types.filter(a => a[t])[0])
    if (!filter || !filter[0]) return;
    if (method == 'set' || method == 'add' || method == 'delete') {
        filter = filter[0];
        type = type[0]
    } else filter = filter.filter(a => a != undefined)
    if (method == 'set' && typeof options.content != filter[type]) return;
    if (!methods.includes(method)) return;
    let data = await groupDb.findOne({
        where: {
            jid: options.jid
        }
    });
    if (!data) {
        if (method == 'set') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(options.content);
            await groupDb.create({
                jid: options.jid,
                [type]: options.content
            })
            return true;
        } else if (method == 'add') {
            const convert_required = filter[type] == 'object' ? true : false;
            if (convert_required) options.content = JSON.stringify(options.content);
            data = await groupDb.create({
                jid: options.jid,
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
module.exports = {groupDB};
