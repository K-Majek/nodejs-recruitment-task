FROM node:14

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm rebuild bcrypt

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]