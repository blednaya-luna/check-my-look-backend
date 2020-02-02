Pre-reqs
-

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/)

- Install [MongoDB](https://docs.mongodb.com/manual/installation/)

Getting started
-

- Clone the repository

```
git clone git@gitlab.com:Blednaya_Luna/check-my-look-backend.git
 ```

 - Install dependencies

```
cd <project_name>
npm install
```

- Configure your mongoDB server

```
# create the db directory
sudo mkdir -p /data/db
# give the db correct read/write permissions
sudo chmod 777 /data/db

# starting from macOS 10.15 even the admin cannot create directory at root
# so lets create the db diretory under the home directory.
mkdir -p ~/data/db
# user account has automatically read and write permissions for ~/data/db.
```

- Start your mongoDB server

```
mongod

# on macOS 10.15 or above the db directory is under home directory
mongod --dbpath ~/data/db
```

- Build and run the project

```
npm run start
```

TODO
-

1. Реализовать POST /signup [вроде как done, нужно проверить]
2. Солить пароли при регистрации, сейчас кладутся как есть [вроде как done, нужно проверить]
3. Реализовать POST /login [вроде как done, нужно проверить]
4. Реализовать POST /logout [вроде как done, нужно проверить]
5. Реализовать POST /forgot
6. Реализовать POST /reset
7. Реализовать POST /account/profile
8. Реализовать POST /account/password
9. Реализовать POST /account/delete
10. Имлементация OAuth авторизации
11. Упаковать сервер в docker
12. Настроить CI/CD
