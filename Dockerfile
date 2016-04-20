FROM mhart/alpine-node:5.10.1

WORKDIR /app
ADD app.js hook_processor.js package.json ./
ADD bin ./bin
ADD public ./public
ADD routes ./routes
ADD views ./views
ADD config ./config

RUN apk add --no-cache make gcc g++ python bash
RUN npm install

EXPOSE 4242
CMD ["npm", "start"]