# Social Netowork - Berl'ista

Network for Berlin hipsters to help find each other, built as a single page application with React & Redux.
You can search people by name as well as by **location**.

## Technology

The network is built with `React.js` & `Redux` at the front and `Node.js` & `Express.js` for the back.
Data is stored in `Postgres` DB.

In registration:

* password is encrypted with `bcrypt` (hashed and salted before storing)
* location is geocoded using npm package `react-places-autocomplete`

When registered:

* user information with `csurf` is stored in cookies, which helps to recognise user and log in automatically
* users visualized on the map with `google-map-react`
* chatroom & online users are managed with `socket.io`
* user avatar is uploaded with `multer` and stored in a cloud of AWS, using `S3` service.

## App Functionality

* Registration/login (_only if not logged in_).

![alt text](https://github.com/najuste/spiced-berlista/blob/master/gifs/berlista_login.gif "Login")

* Default profile image can be changed by choosing a photo from computer, as well as user can edit his description.
* User by search for users by name or on the map.
* User can chat with other users who are online in the chatroom.

![alt text](https://github.com/najuste/spiced-berlista/blob/master/gifs/berlista_navigation.gif "Navigation")

* User can be befriended, if another user accepts. There are possibilities to cancel the sent request, deny the requested friendship or also unfriend the user.

![alt text](https://github.com/najuste/spiced-berlista/blob/master/gifs/berlista_friends.gif "Friendships")

* User can leave a message on the other users wall, only when the are friends.

## To launch

_should have node installed_.
To install dependencies: `npm install`.

### Using this repo in development

The `src` directory is with client-side Javascript code. The entry point of React application is file `src/start.js`.

To run your app in development, you need to start two servers.

1. `bundle-server.js` - this server will listen on port 8081 and does nothing but compile the code in `src/start.js` and its dependencies into a single bundle which it serves from the url `/bundle.js`. It uses [`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware) to do this. This middleware keeps all the compiled files in memory and doesn't ever write a file to disk. Every time you edit one of the files in your bundle, it detects the change and automatically recompiles. Thus, you do not have to restart this process every time you make a change to one of your client-side Javascript files. After a change is saved, the updated `/bundle.js` will be available automatically.

2. `index.js` - this server listens on port 8080 and it is where all your normal express stuff should go. When `index.js` is running in development, requests for `/bundle.js` will cause a request to be made to `http://localhost:8081/bundle.js` and the result served (it uses the [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware) to do this). You can restart this server every time you make a server-side change and not have to wait for `bundle.js` to recompile before you can test the change.
