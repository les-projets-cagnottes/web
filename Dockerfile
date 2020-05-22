FROM node:12.8.1-stretch as builder

ARG configuration

COPY package.json package-lock.json ./
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .
RUN npm run ng build -- --configuration $configuration --output-path=dist

FROM nginx:1.17.3

ARG configuration

COPY nginx/${configuration}.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist/fr /usr/share/nginx/html
CMD nginx -g 'daemon off;'