# Instaco

Instaco reads exported Instagram files, imports the data into a local SQLite database, and produces a text file containing accounts that no longer follow you.

#### Summary

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Workflow](#workflow)
- [Database structure](#database-structure)
- [Notes](#notes)
- [Author](#author)
- [License](#license)

___

### Requirements
- ```npm```
- ```node.js v22.14.0``` or higher
- Instagram exported files in JSON format (followers and following)
- A ```shell``` or ```terminal``` to run the script

___

### Installation

Inside the root of the project, run:

```
npm i
``` 

Compile TypeScript and start the application with:

```
npm run build:start
```

or, if you have already built the project with npm run build:

```
npm start
```

___

### Configuration

The main configuration is located in the .env file.

```
# path to the SQLite database file
DB_FILE_PATH=./db/sqlite.db

# folder containing input JSON files
INPUT_PATH=data

# maximum number of records imported in a single batch
MAX_BATCH_SIZE=500

# folder where output files will be saved
OUTPUT_PATH=data/list
```

___

### Workflow

- Instaco reads configuration from .env
- It finds JSON files in INPUT_PATH
- It automatically identifies whether each file is followers or following
- It imports the data into two SQLite tables (followers and followings)
- It generates an ```unfollow_me_YYYYMMDD.txt``` file in ```OUTPUT_PATH``` that contains a list of usernames, one per line, corresponding to accounts you follow that no longer follow you back.

___

#### Database structure

The SQLite database uses two tables: ```followers``` and ```followings```.

Each table contains:

```
username   TEXT PRIMARY KEY,    -- IG username
ig_from    INTEGER NOT NULL,    -- original Instagram timestamp

created_at INTEGER NOT NULL,    -- local creation timestamp
updated_at INTEGER NOT NULL     -- local update timestamp
```

___

### Notes

The process supports batch imports to handle large files.

___

### Author

Francesco 'Frash' Ascenzi

___

### License

Apache License 2.0.

See the ```LICENSE``` file in the project root for more details.