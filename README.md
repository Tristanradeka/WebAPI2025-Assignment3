Setup:
-You will need all packages that are required in app.js, these dependencies can also be found in package.json
-You will also need a MongoDB database named properly, with collections "Games" and "users". If you name your db differently, update app.js accordingly. The MongoDB connection can be found at lines 35-38 in app.js

Authentication works similarly to the basic CRUD features. The register route creates a new user in the db based on the input. The login route checks for existing users and makes sure the password given matches if the user is found. All CRUD routes are protected by the isAuthenticated function. If the user is logged in, the routes will work as intended, if not they will be automatically redirected to the login page
