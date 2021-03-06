# GeekU

**Table of Contents**

- [Overview](#overview)
- [Run the Project](#run-the-project)


## Overview

The GeekU project is a sandbox University Transcript Application, with
enough real-world requirements to make it interesting.

- model M:M relationships of course/student using **MongoDB**
- development of **both client and server** logic managed through an **npm
  build process**
- single page app (using **React.js**)
  * employing **routes**
  * employing **redux** (Flex architecture)
  * modern GUI
- server-side rest implementation (using **express.js**)
- **ES6 JavaScript** usage (both client and server)
- ?? more


## Run the Project

If you want to run this project on your local machine, simply clone
the git repo (or zip it up), and follow these instructions.

### Prerequisite

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.org/) installed


### Setup

```
$ cd {project-root}

$ npm install    # install project dependencies
$ npm run build  # initial build of system

$ mongod         # launch MongoDB server
$ TODO           # load sample mongo data
```

### For Production

For production, simply run the rest server.

```
$ cd {project-root}
$ npm run server-run
> browse localhost:8080
```

### For Development

For development, build (and re-build on change) the client/server
bundles -AND- launch the rest server (which restarts on change) -AND-
run unit tests (triggered by changes).

```
$ cd {project-root}
$ npm run dev
> browse localhost:8080
```

### NODE_ENV envirnment variable

The The NODE_ENV envirnment variable is used as follows:
- NODE_ENV=production
  * clientBundle is minified (currently in clientBundle.js TODO: clientBundle.min.js)
- NODE_ENV=development [the default]
  * source maps are generated

Example: 

```
$ cd {project-root}
$ NODE_ENV=production npm run build   # build a production distribution
```

