FROM node:18-slim as builder

ARG configuration

COPY package.json package-lock.json ./
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .
RUN npm run ng build -- --configuration $configuration --output-path=dist

FROM nginx:1.21.0

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist /usr/share/nginx/html
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'