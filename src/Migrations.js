import app from "./App.js";

class Migrations
{
    constructor()
    {
        this.list = {
            "create_guild_table" : "createGuildTable",
            "create_song_table" : "createSongTable",
            "create_keyword_table" : 'createKeywordTable',
        };
        this.migrationsTableName = 'migrations';
    }

    async init()
    {
        await this.initMigrationsTable();
        await this.runMigrations();
    }

    async initMigrationsTable()
    {
        let db = app.service('db');
        let tableName = this.migrationsTableName;
        let tableResult = await db('sqlite_master').where({
            type: 'table',
            name: tableName,
        });

        if (0 == tableResult.length) {
            console.log('init migrations table');
            await db.schema.createTable(this.migrationsTableName, table => {
                table.string('name').unique();
            });
        }
    }

    async runMigrations()
    {
        let db = app.service('db');
        let tableName = this.migrationsTableName;
        let migrationsList = this.list;
        let migrationsModule = this;
        let savedMigrations = await db(tableName).select();
        let savedMigrationsIndex = {};
        for(let index = 0; index < savedMigrations.length; index++) {
            let row = savedMigrations[index];
            savedMigrationsIndex[row.name] = true;
        }
        for(let name in migrationsList) {
            if (!migrationsList.hasOwnProperty(name)) continue;
            let migrationMethod = migrationsList[name];
            if ("undefined" != typeof(savedMigrationsIndex[migrationMethod])) continue;
            console.log('run migration:', migrationMethod);
            await migrationsModule[migrationMethod](db);
            await migrationsModule.registerMigration(migrationMethod, db);
        }
    }

    async registerMigration(name, db)
    {
        await db(this.migrationsTableName).insert({ name: name });
    }


    async createGuildTable(db)
    {
        await db.schema.createTable('guild', table => {
            table.string('id').notNull().unique();
            table.tinyint('status').notNull();
            table.text('settings');
            table.float('volume');
        });
    }

    async createSongTable(db)
    {
        await db.schema.createTable('song', table => {
            table.increments('id');
            table.string('guild_id').notNull().references('guild.id');
            table.string('title').notNull();
            table.string('url').notNull();
            table.string('length_seconds');
            table.string('image');
            table.tinyint('type').notNull();
        });
    }

    async createKeywordTable(db)
    {
        await db.schema.createTable('keyword', table => {
            table.increments('id');
            table.string('name').notNull();
            table.tinyint('genre').notNull().defaultTo(false);
        });

        await db.schema.createTable('song_keyword', table => {
            table.integer('keyword_id').notNull().references('keyword.id');
            table.integer('song_id').notNull().references('song.id');
        });
    }

}

const migrations = new Migrations();
export default migrations;
