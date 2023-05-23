import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import Discord from 'discord.js';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import migrations from './Migrations.js';
import CommandListener from "./CommandListener.js";
import locale from "./Locale.js";

import knex from "knex";

class App
{

    constructor()
    {
        this.services = {};
        this.guilds = new Map();
    }

    run(runClient = true)
    {
        console.log('<!!!INIT!!!>');

        dotenv.config();

        // sqlite3.verbose();
        // this.registerService("db", Db, {
        //     connection: new sqlite3.Database(process.env.SQLITE_FILE, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE)
        // });
        let dbConnection = knex({
            client: 'sqlite3',
            connection: {
                filename: process.env.SQLITE_FILE
            },
            useNullAsDefault: true,
        });
        this.registerServiceObject('db', dbConnection);

        this.registerServiceObject('migrations', migrations);

        this.registerServiceObject('locale', locale);

        if (runClient) {
            let client = new Discord.Client();
            this.registerServiceObject("client", client);
            client.login(process.env.APP_TOKEN).then(function (result) {
                app.registerService('commands', CommandListener);
                console.log('<!!!CLIENT STARTED!!!>');
            });
        }

        console.log('<!!!END INIT!!!>');
    }

    service (name) {
        return this.services[name];
    }

    /**
     * @param {string} name
     * @param {function|object} service
     * @param {object} config
     */
    registerService(name, service, config = {})
    {
        config = config || {};

        if ('undefined' !== typeof this.services[name]) {
            throw new Error('The service ' + name + ' has been already registered!');
        }

        this.services[name] = new service();
        this.extend(this.services[name], config);

        if ('function' === typeof(this.services[name]['init'])) {
            this.services[name]['init']();
        }
    }

    registerServiceObject(name, service, config = {})
    {
        config = config || {};

        if ('undefined' !== typeof this.services[name]) {
            throw new Error('The service ' + name + ' has been already registered!');
        }

        this.services[name] = service;
        this.extend(this.services[name], config);

        if ('function' === typeof(this.services[name]['init'])) {
            this.services[name]['init']();
        }
    }

    /**
     * @param {Object} target
     * @param {Object} object
     */
    extend(target, object)
    {
        for(let key in object) {
            if (object.hasOwnProperty(key)) {
                target[key] = object[key];
            }
        }
        return target;
    }

    setThis(func, state) {
        return function() {
            return func.apply(state, arguments);
        }
    }
}
const app = new App();
export default app;