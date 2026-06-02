FROM node:20-alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++
RUN npm install

EXPOSE 3000/tcp

CMD ["npm", "start"]
